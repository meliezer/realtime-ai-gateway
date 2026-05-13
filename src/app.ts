import Fastify from 'fastify';

import { redis } from './lib/redis.js';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

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

  return app;
}
