import Fastify from 'fastify';

import type { ChatCompletionRequest } from './ai/openai-types.js';
import { streamAiResponse } from './ai/stream-ai-response.js';
import { createRedisConnection } from './lib/redis.js';

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

    await streamAiResponse(request, reply, {
      prompt,
    });
  });

  app.post('/v1/chat/completions', async (request, reply) => {
    const body = request.body as ChatCompletionRequest;

    const lastMessage = body.messages[body.messages.length - 1];

    const prompt = lastMessage?.content ?? 'empty prompt';

    await streamAiResponse(request, reply, {
      prompt,
      openAiFormat: true,
    });
  });

  return app;
}
