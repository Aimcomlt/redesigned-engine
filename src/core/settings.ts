import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";

const settingsSchema = z.object({
  chainId: z.number().int().positive(),
  rpcUrl: z.string().url(),
  minProfitUsd: z.number().positive(),
  slippageBps: z.number().min(0).max(2000),
  gasUnits: z.string().regex(/^\d+$/),
});

export type Settings = z.infer<typeof settingsSchema>;

const defaultFile = path.resolve(__dirname, "../../settings.json");

export async function saveSettings(
  input: unknown
): Promise<{ success: true; data: Settings } | { success: false; error: string }> {
  const result = settingsSchema.safeParse(input);
  if (!result.success) {
    const issues = (result.error as any).issues || (result.error as any).errors || [];
    const error = issues.map((e: any) => e.message).join(", ");
    return { success: false, error };
  }
  const filePath = process.env.SETTINGS_FILE ?? defaultFile;
  try {
    await fs.writeFile(filePath, JSON.stringify(result.data, null, 2), "utf8");
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
