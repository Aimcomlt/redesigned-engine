import { describe, expect, test, vi } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import request from 'supertest';

const metricName = 'sse_clients_active';

describe('SSE client metrics', () => {
  test('increments and exposes active client gauge', async () => {
    vi.resetModules();
    process.env.AUTH_TOKEN = 't';
    const { default: app } = await import('../index');
    const { register } = await import('@/utils/metrics');
    const server = app.listen(0);

    try {
      const port = (server.address() as AddressInfo).port;
      const sreq = http.get({
        hostname: '127.0.0.1',
        port,
        path: '/api/stream',
        headers: { Authorization: 'Bearer t' }
      });

      await new Promise(resolve => sreq.once('response', resolve));
      await new Promise(r => setTimeout(r, 10));

      const metric = register.getSingleMetric(metricName);
      expect(metric?.hashMap['']?.value).toBe(1);

      sreq.destroy();
      await new Promise(r => setTimeout(r, 10));
      expect(register.getSingleMetric(metricName)?.hashMap['']?.value).toBe(0);

      const res = await request(server)
        .get('/metrics')
        .set('Authorization', 'Bearer t');
      expect(res.status).toBe(200);
      expect(res.text).toMatch(metricName);
    } finally {
      server.close();
    }
  });
});
