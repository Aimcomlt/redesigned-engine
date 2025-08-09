import { EventEmitter } from 'node:events';

export const eventBus = new EventEmitter();
// Tip: event names: "block", "v2:sync", "v2:swap", "v3:swap", "ws:error", "candidate", "log"
