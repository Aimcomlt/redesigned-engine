import { describe, test, expect, afterAll } from 'vitest';
import { loadConfig } from './config';

const originalEnv = process.env;

const baseEnv = {
  RPC_URL: 'https://example.com',
  PRIVATE_KEY: '0x' + '1'.repeat(64),
  MIN_PROFIT_USD: '0',
  SLIPPAGE_BPS: '0',
};

function setEnv(overrides: Record<string, string | undefined> = {}) {
  process.env = { ...baseEnv, ...overrides } as any;
}

describe('loadConfig', () => {
  afterAll(() => {
    process.env = originalEnv;
  });

  test('loads config when execution disabled', async () => {
    setEnv({ EXEC_ENABLED: '0' });
    const cfg = await loadConfig();
    expect(cfg.execEnabled).toBe(false);
    expect(cfg.wsRpc).toBeUndefined();
    expect(cfg.bundleSignerKey).toBeUndefined();
  });

  test('requires WS_RPC when EXEC_ENABLED=1', async () => {
    setEnv({ EXEC_ENABLED: '1', BUNDLE_SIGNER_KEY: '0x' + '2'.repeat(64) });
    await expect(loadConfig()).rejects.toThrow('WS_RPC is required when EXEC_ENABLED=1');
  });

  test('requires BUNDLE_SIGNER_KEY when EXEC_ENABLED=1', async () => {
    setEnv({ EXEC_ENABLED: '1', WS_RPC: 'ws://localhost:8546' });
    await expect(loadConfig()).rejects.toThrow('BUNDLE_SIGNER_KEY is required when EXEC_ENABLED=1');
  });

  test('loads config when EXEC_ENABLED=1 with required variables', async () => {
    setEnv({
      EXEC_ENABLED: '1',
      WS_RPC: 'ws://localhost:8546',
      BUNDLE_SIGNER_KEY: '0x' + '2'.repeat(64),
    });
    const cfg = await loadConfig();
    expect(cfg.execEnabled).toBe(true);
    expect(cfg.wsRpc).toBe('ws://localhost:8546');
    expect(cfg.bundleSignerKey).toBe('0x' + '2'.repeat(64));
  });
});

