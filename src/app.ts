import crypto from 'node:crypto';

import Fastify from 'fastify';

import { createRedisConnection } from './lib/redis.js';
import { aiQueue } from './queue/ai-queue.js';
import { getStreamChannel } from './queue/channel.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  const redis = createRedisConnection();

  app.get('/health/live', async () => {
    return {
      status: 'ok',
    };
  });

  app.get('/health/ready', async (_, reply) => {
    try {
      await redis.ping();

      return {
        status: 'ready',
      };
    } catch (error) {
      app.log.error(error, 'Readiness check failed');

      return reply.status(503).send({
        status: 'not_ready',
      });
    }
  });

  app.get('/ai/stream', async (request, reply) => {
    const prompt =
      typeof request.query === 'object' &&
      request.query !== null &&
      'prompt' in request.query &&
      typeof request.query.prompt === 'string'
        ? request.query.prompt
        : 'default prompt';

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
        reply.raw.write(`data: ${payload.token}\n\n`);
      }

      if (payload.type === 'done') {
        reply.raw.write('event: done\n');
        reply.raw.write('data: stream completed\n\n');

        if (!closed) {
          closed = true;

          void subscriber.quit();
        }

        reply.raw.end();
      }
    });

    await subscriber.subscribe(channel);

    const job = await aiQueue.add('stream-request', {
      prompt,
      streamId,
    });

    app.log.info(
      {
        jobId: job.id,
        streamId,
        prompt,
      },
      'AI streaming job enqueued',
    );

    request.raw.on('close', async () => {
      if (!closed) {
        closed = true;

        await subscriber.quit();
      }
    });
  });

  return app;
}
