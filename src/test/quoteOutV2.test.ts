import { expect, test } from 'vitest';
import { quoteOutV2 } from '../core/v2';

test('quoteOutV2 computes output with fee', () => {
  const out = quoteOutV2(1000n, 1000n, 100n);
  expect(out).toBe(90n);
});

test('quoteOutV2 increases with larger input', () => {
  const small = quoteOutV2(1000n, 1000n, 100n);
  const large = quoteOutV2(1000n, 1000n, 200n);
  expect(large).toBeGreaterThan(small);
});
