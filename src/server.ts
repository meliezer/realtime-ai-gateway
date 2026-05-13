import { buildApp } from './app.js';
import { env } from './config/env.js';
import { createRedisConnection } from './lib/redis.js';
import { aiWorker } from './queue/ai-worker.js';

const app = buildApp();

const redis = createRedisConnection();

const start = async () => {
  try {
    await redis.connect();

    app.log.info('Redis connected');

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    app.log.info(
      {
        workerName: aiWorker.name,
      },
      'AI worker initialized',
    );

    app.log.info(
      {
        port: env.PORT,
      },
      'Server started',
    );
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }
};

start();

const shutdown = async () => {
  app.log.info('Shutting down application...');

  await redis.quit();
  await aiWorker.close();
  await app.close();

  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
