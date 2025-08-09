import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkAllowances } from '../../index';
import { logger } from '../utils/logger';

// Mutable allowance map used by the ethers.Contract mock
const allowances: Record<string, Record<string, bigint>> = {};

vi.mock('ethers', async () => {
  const actual: any = await vi.importActual('ethers');
  class MockContract {
    address: string;
    constructor(address: string) {
      this.address = address;
    }
    allowance(_owner: string, spender: string) {
      return Promise.resolve(allowances[this.address]?.[spender] ?? 0n);
    }
  }
  return { ...actual, Contract: MockContract };
});

const owner = '0x000000000000000000000000000000000000dEaD';
const provider = {
  getSigner() {
    return {
      getAddress: () => Promise.resolve(owner)
    };
  }
} as any;

const token0 = {
  address: '0x0000000000000000000000000000000000000001',
  decimals: 18,
  priceUsd: 0n
};
const token1 = {
  address: '0x0000000000000000000000000000000000000002',
  decimals: 18,
  priceUsd: 0n
};
const venues = [
  { name: 'A', type: 'v2' as const, address: '0x0000000000000000000000000000000000000011' },
  { name: 'B', type: 'v2' as const, address: '0x0000000000000000000000000000000000000022' }
];
const amountIn = 1000n;

beforeEach(() => {
  allowances[token0.address] = {
    [venues[0].address]: 2000n,
    [venues[1].address]: 2000n
  };
  allowances[token1.address] = {
    [venues[0].address]: 2000n,
    [venues[1].address]: 2000n
  };
});

describe('checkAllowances', () => {
  it('returns true when all allowances are sufficient', async () => {
    const ok = await checkAllowances({
      provider,
      venues,
      amountIn,
      token0,
      token1
    } as any);
    expect(ok).toBe(true);
  });

  it('returns false and logs error on insufficient allowance', async () => {
    allowances[token1.address][venues[1].address] = 500n;
    const spy = vi.spyOn(logger, 'error');
    const ok = await checkAllowances({
      provider,
      venues,
      amountIn,
      token0,
      token1
    } as any);
    expect(ok).toBe(false);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
