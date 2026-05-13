import { buildApp } from './app.js';
import { env } from './config/env.js';
import { redis } from './lib/redis.js';

const app = buildApp();

const start = async () => {
  try {
    await redis.connect();

    app.log.info('Redis connected');

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    app.log.info('Server started');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

const shutdown = async () => {
  app.log.info('Shutting down application...');

  await redis.quit();

  await app.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
