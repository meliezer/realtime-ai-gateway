import { aiWorker } from './queue/ai-worker.js';
import { createRedisConnection } from './lib/redis.js';
import { buildApp } from './app.js';
import { env } from './config/env.js';

const redis = createRedisConnection();

const start = async () => {
  const app = await buildApp();

  try {
    await redis.connect();

    app.log.info('Redis connected');

    app.log.info(
      {
        workerName: aiWorker.name,
      },
      'AI worker initialized',
    );

    await app.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    app.log.info(
      {
        port: env.PORT,
      },
      'Server started',
    );

    const shutdown = async () => {
      app.log.info('Shutting down application...');

      await aiWorker.close();

      await redis.quit();

      await app.close();

      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    app.log.error(err);

    process.exit(1);
  }
};

await start();
