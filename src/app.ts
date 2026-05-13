import Fastify from 'fastify';
import { createRedisConnection } from './lib/redis.js';
import { fakeAiStream } from './ai/fake-ai-provider.js';
import { aiQueue } from './queue/ai-queue.js';

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

    const job = await aiQueue.add('stream-request', {
      prompt,
    });

    app.log.info(
      {
        jobId: job.id,
        prompt,
      },
      'AI streaming job enqueued',
    );

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    reply.raw.flushHeaders();

    try {
      for await (const token of fakeAiStream(prompt)) {
        reply.raw.write(`data: ${token}\n\n`);
      }

      reply.raw.write('event: done\n');
      reply.raw.write('data: stream completed\n\n');
    } catch (error) {
      app.log.error(error, 'Streaming failed');

      reply.raw.write('event: error\n');
      reply.raw.write('data: streaming failed\n\n');
    } finally {
      reply.raw.end();
    }
  });

  return app;
}
