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
    logger.info(
      {
        id: job.id,
        data: job.data,
      },
      'Processing AI job',
    );

    const prompt = job.data.prompt as string;

    const channel = getStreamChannel(job.data.streamId as string);

    for await (const token of fakeAiStream(prompt)) {
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

    return {
      completed: true,
    };
  },
  {
    connection: createRedisConnection(),
  },
);
