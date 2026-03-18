import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z.string().min(1),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  FRONTEND_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),
  COOKIE_NAME: z.string().default('sortlearn_refresh'),
  MAIL_HOST: z.string().min(1),
  MAIL_PORT: z.coerce.number().int().positive(),
  MAIL_SECURE: z.coerce.boolean().default(false),
  MAIL_USER: z.string().optional().default(''),
  MAIL_PASSWORD: z.string().optional().default(''),
  MAIL_FROM: z.string().email(),
  VERIFICATION_CODE_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
});

export const env = envSchema.parse(process.env);

function normalizeOrigin(value: string) {
  return new URL(value.trim()).origin;
}

export const allowedOrigins = Array.from(
  new Set([env.FRONTEND_URL, ...env.CORS_ORIGIN.split(',').filter(Boolean)].map(normalizeOrigin)),
);

export const isProduction = env.NODE_ENV === 'production';
