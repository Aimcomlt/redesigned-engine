import { afterEach, expect, test } from 'vitest';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { saveSettings, type Settings } from './settings';

let tmpFile: string | null = null;

afterEach(async () => {
  if (tmpFile) {
    try { await fs.unlink(tmpFile); } catch {}
    tmpFile = null;
  }
  delete process.env.SETTINGS_FILE;
});

test('saves valid settings to file', async () => {
  tmpFile = join(tmpdir(), `settings-${Date.now()}.json`);
  process.env.SETTINGS_FILE = tmpFile;

  const input: Settings = {
    chainId: 1,
    rpcUrl: 'http://localhost',
    minProfitUsd: 1,
    slippageBps: 10,
    gasUnits: '21000'
  };

  const result = await saveSettings(input);
  expect(result).toEqual({ success: true, data: input });
  const stored = JSON.parse(await fs.readFile(tmpFile, 'utf8'));
  expect(stored).toEqual(input);
});

test('returns error for invalid settings', async () => {
  tmpFile = join(tmpdir(), `settings-${Date.now()}-invalid.json`);
  process.env.SETTINGS_FILE = tmpFile;
  const result = await saveSettings({ chainId: 0 });
  expect(result.success).toBe(false);
});
