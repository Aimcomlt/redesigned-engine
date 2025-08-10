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

// Persist settings within the project root. Paths outside this directory are
// rejected to avoid accidental writes elsewhere on the filesystem.
const baseDir = path.resolve(__dirname, "../../");
const defaultFile = path.join(baseDir, "settings.json");

export async function saveSettings(
  input: unknown
): Promise<{ success: true; data: Settings } | { success: false; error: string }> {
  const result = settingsSchema.safeParse(input);
  if (!result.success) {
    const issues = (result.error as any).issues || (result.error as any).errors || [];
    const error = issues.map((e: any) => e.message).join(", ");
    return { success: false, error };
  }
  const filePath = path.resolve(process.env.SETTINGS_FILE ?? defaultFile);
  // Ensure the resolved file path stays within the allowed base directory.
  if (path.relative(baseDir, filePath).startsWith("..")) {
    return { success: false, error: "Settings path escapes allowed directory" };
  }
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(result.data, null, 2), "utf8");
    return { success: true, data: result.data };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
