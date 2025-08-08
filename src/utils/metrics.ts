import { Counter, Registry } from 'prom-client';

/** Central registry for all application metrics */
export const register = new Registry();

/** Counts successful trades */
export const successCounter = new Counter({
  name: 'trade_success_total',
  help: 'Total number of successful trades',
  registers: [register]
});

/** Counts failed trades */
export const failureCounter = new Counter({
  name: 'trade_failure_total',
  help: 'Total number of failed trades',
  registers: [register]
});

/** Tracks cumulative gas used across trades */
export const gasCounter = new Counter({
  name: 'trade_gas_used_total',
  help: 'Total gas consumed by trades',
  registers: [register]
});
