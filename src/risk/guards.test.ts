import { expect, test } from 'vitest';
import { checkGuards } from './guards';

test('checkGuards returns messages when all checks pass', () => {
  const msgs = checkGuards({
    gasPrice: 100n,
    maxGasPrice: 200n,
    reserve0: 1000n,
    reserve1: 1500n,
    minLiquidity: 500n,
    blockTag: 10,
    currentBlock: 12,
    maxBlockTagDrift: 5
  });
  expect(msgs).toHaveLength(3);
});

test('checkGuards throws on high gas price', () => {
  expect(() =>
    checkGuards({
      gasPrice: 300n,
      maxGasPrice: 200n,
      reserve0: 1000n,
      reserve1: 1500n,
      minLiquidity: 500n,
      blockTag: 10,
      currentBlock: 12,
      maxBlockTagDrift: 5
    })
  ).toThrow('Gas price');
});

test('checkGuards throws on low liquidity', () => {
  expect(() =>
    checkGuards({
      gasPrice: 100n,
      maxGasPrice: 200n,
      reserve0: 300n,
      reserve1: 400n,
      minLiquidity: 500n,
      blockTag: 10,
      currentBlock: 12,
      maxBlockTagDrift: 5
    })
  ).toThrow('Pool liquidity');
});

test('checkGuards throws on block tag drift', () => {
  expect(() =>
    checkGuards({
      gasPrice: 100n,
      maxGasPrice: 200n,
      reserve0: 1000n,
      reserve1: 1500n,
      minLiquidity: 500n,
      blockTag: 10,
      currentBlock: 20,
      maxBlockTagDrift: 5
    })
  ).toThrow('Block tag drift');
});
