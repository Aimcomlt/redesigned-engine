import { describe, test, expect, vi } from 'vitest';

const importServer = () => import('#server/index');

describe('environment variables', () => {
  test('exits when AUTH_TOKEN is missing', async () => {
    vi.resetModules();
    delete process.env.AUTH_TOKEN;
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    await expect(importServer()).rejects.toThrow('1');
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
  });

  test('exits when EXEC_ENABLED=1 but WS_RPC missing', async () => {
    vi.resetModules();
    process.env.AUTH_TOKEN = 't';
    process.env.EXEC_ENABLED = '1';
    delete process.env.WS_RPC;
    delete process.env.BUNDLE_SIGNER_KEY;
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    await expect(importServer()).rejects.toThrow('1');
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
  });

  test('exits when EXEC_ENABLED=1 but BUNDLE_SIGNER_KEY missing', async () => {
    vi.resetModules();
    process.env.AUTH_TOKEN = 't';
    process.env.EXEC_ENABLED = '1';
    process.env.WS_RPC = 'ws://localhost';
    delete process.env.BUNDLE_SIGNER_KEY;
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    await expect(importServer()).rejects.toThrow('1');
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
  });
});
