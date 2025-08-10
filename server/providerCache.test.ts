import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest';

describe('provider cache eviction', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    process.env.AUTH_TOKEN = 't';
    process.env.PROVIDER_TTL_MS = '50';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('getProvider evicts providers after TTL', async () => {
    const { getProvider, destroyProviders } = await import('#server/index');
    const p1 = getProvider('http://localhost:8545');
    const destroySpy = vi.spyOn(p1, 'destroy');
    const p2 = getProvider('http://localhost:8545');
    expect(p2).toBe(p1);
    vi.advanceTimersByTime(60);
    const p3 = getProvider('http://localhost:8545');
    expect(p3).not.toBe(p1);
    expect(destroySpy).toHaveBeenCalledOnce();
    destroyProviders();
  });

  test('destroyProviders removes expired providers', async () => {
    const { getProvider, destroyProviders } = await import('#server/index');
    const p1 = getProvider('http://localhost:8545');
    const destroySpy = vi.spyOn(p1, 'destroy');
    vi.advanceTimersByTime(60);
    destroyProviders();
    expect(destroySpy).toHaveBeenCalledOnce();
  });
});

