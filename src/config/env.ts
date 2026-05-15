import dotenv from 'dotenv';
import { z } from 'zod';

import { logger } from '../lib/logger.js';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().positive(),

  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive(),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),

  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error(
    {
      errors: z.treeifyError(parsed.error),
    },
    'Invalid environment configuration',
  );

  process.exit(1);
}

export const env = parsed.data;
