import { Worker } from 'bullmq';

import { createRedisConnection } from '../lib/redis.js';
import { logger } from '../lib/logger.js';

export const aiWorker = new Worker(
  'ai-stream',
  async (job) => {
    logger.info(
      {
        id: job.id,
        data: job.data,
      },
      'Processing AI job',
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
      completed: true,
    };
  },
  {
    connection: createRedisConnection(),
  },
);
