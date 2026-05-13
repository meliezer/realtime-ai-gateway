import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../src/app.js';
import { redis } from '../src/lib/redis.js';

const app = buildApp();

beforeAll(async () => {
  await redis.connect();

  await app.ready();
});

afterAll(async () => {
  await redis.quit();

  await app.close();
});

describe('GET /health/live', () => {
  it('should return live status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/live',
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      status: 'ok',
    });
  });
});

describe('GET /health/ready', () => {
  it('should return ready status', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health/ready',
    });

    expect(response.statusCode).toBe(200);

    expect(response.json()).toEqual({
      status: 'ready',
    });
  });
});
