import { expect, test } from 'vitest';
import {
  checkSlippage,
  calcMinOut,
  computeSlippageAdjustedOut
} from '../risk/slippage';

test('calcMinOut applies slippage to amount', () => {
  expect(calcMinOut(1000n, 100)).toBe(990n);
});

test('computeSlippageAdjustedOut mirrors calcMinOut', () => {
  expect(computeSlippageAdjustedOut(1000n, 200)).toBe(calcMinOut(1000n, 200));
});

test('checkSlippage validates price deviation', () => {
  expect(checkSlippage(100, 99, 200)).toBe(true);
  expect(checkSlippage(100, 95, 200)).toBe(false);
});
