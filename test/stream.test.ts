import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { createRedisConnection } from '../src/lib/redis.js';

const app = buildApp();

const redis = createRedisConnection();

beforeAll(async () => {
  await redis.connect();

  await app.ready();
});

afterAll(async () => {
  await redis.quit();

  await app.close();
});

describe('GET /ai/stream', () => {
  it('should stream AI response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/ai/stream?prompt=test',
    });

    expect(response.statusCode).toBe(200);

    expect(response.headers['content-type']).toContain('text/event-stream');

    expect(response.body).toContain('data: Processing');

    expect(response.body).toContain('data: test');

    expect(response.body).toContain('event: done');
  });
});
