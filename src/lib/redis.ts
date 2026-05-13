import { Redis } from 'ioredis';

import { env } from '../config/env.js';

export function createRedisConnection() {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,

    maxRetriesPerRequest: null,

    lazyConnect: true,
  });
}
