import { Queue } from 'bullmq';

import { createRedisConnection } from '../lib/redis.js';

export const aiQueue = new Queue('ai-stream', {
  connection: createRedisConnection(),

  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});
