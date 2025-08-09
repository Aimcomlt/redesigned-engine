import { EventEmitter } from 'events';

/**
 * Global event emitter used to surface engine events such as
 * new blocks, price quotes and candidate updates. Consumers like
 * the HTTP server can subscribe and rebroadcast them via Server-Sent
 * Events or WebSockets.
 */
export const engineEvents = new EventEmitter();

export default engineEvents;
