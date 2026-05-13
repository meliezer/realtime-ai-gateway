import { Worker } from 'bullmq';

import { fakeAiStream } from '../ai/fake-ai-provider.js';
import { logger } from '../lib/logger.js';
import { createRedisConnection } from '../lib/redis.js';
import { getStreamChannel } from './channel.js';

const publisher = createRedisConnection();

await publisher.connect();

export const aiWorker = new Worker(
  'ai-stream',
  async (job) => {
    try {
      logger.info(
        {
          id: job.id,
          streamId: job.data.streamId,
          data: job.data,
        },
        'Processing AI job',
      );

      const prompt = job.data.prompt as string;

      const channel = getStreamChannel(job.data.streamId as string);

      const startedAt = Date.now();

      let tokenCount = 0;

      for await (const token of fakeAiStream(prompt)) {
        tokenCount += 1;

        await publisher.publish(
          channel,
          JSON.stringify({
            type: 'token',
            token,
          }),
        );
      }

      await publisher.publish(
        channel,
        JSON.stringify({
          type: 'done',
        }),
      );

      logger.info(
        {
          id: job.id,
          streamId: job.data.streamId,
          tokenCount,
          durationMs: Date.now() - startedAt,
        },
        'AI stream completed',
      );

      return {
        completed: true,
      };
    } catch (error) {
      logger.error(
        {
          error,
          id: job.id,
          streamId: job.data.streamId,
        },
        'AI stream failed',
      );

      throw error;
    }
  },
  {
    connection: createRedisConnection(),
    concurrency: 5,
  },
);
