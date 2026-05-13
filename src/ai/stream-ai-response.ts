import crypto from 'node:crypto';

import type { FastifyReply, FastifyRequest } from 'fastify';

import { createRedisConnection } from '../lib/redis.js';
import { aiQueue } from '../queue/ai-queue.js';
import { getStreamChannel } from '../queue/channel.js';

interface StreamOptions {
  prompt: string;

  openAiFormat?: boolean;
}

export async function streamAiResponse(
  request: FastifyRequest,
  reply: FastifyReply,
  options: StreamOptions,
) {
  const subscriber = createRedisConnection();

  await subscriber.connect();

  const streamId = crypto.randomUUID();

  const channel = getStreamChannel(streamId);

  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');

  reply.raw.flushHeaders();

  let closed = false;

  subscriber.on('message', (receivedChannel, message) => {
    if (receivedChannel !== channel) {
      return;
    }

    const payload = JSON.parse(message) as
      | {
          type: 'token';
          token: string;
        }
      | {
          type: 'done';
        };

    if (payload.type === 'token') {
      if (options.openAiFormat) {
        reply.raw.write(
          `data: ${JSON.stringify({
            choices: [
              {
                delta: {
                  content: payload.token,
                },
              },
            ],
          })}\n\n`,
        );
      } else {
        reply.raw.write(`data: ${payload.token}\n\n`);
      }
    }

    if (payload.type === 'done') {
      if (options.openAiFormat) {
        reply.raw.write('data: [DONE]\n\n');
      } else {
        reply.raw.write('event: done\n');
        reply.raw.write('data: stream completed\n\n');
      }

      if (!closed) {
        closed = true;

        void subscriber.quit();
      }

      reply.raw.end();
    }
  });

  await subscriber.subscribe(channel);

  const job = await aiQueue.add('stream-request', {
    prompt: options.prompt,
    streamId,
  });

  request.log.info(
    {
      jobId: job.id,
      streamId,
      prompt: options.prompt,
    },
    'AI streaming job enqueued',
  );

  request.raw.on('close', async () => {
    if (!closed) {
      closed = true;

      await subscriber.quit();
    }
  });
}
