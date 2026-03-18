import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { logger } from './utils/logger.js';

const app = createApp();

async function bootstrap() {
  await prisma.$connect();

  app.listen(env.PORT, () => {
    logger.info('server.started', {
      port: env.PORT,
      frontendUrl: env.FRONTEND_URL,
    });
  });
}

void bootstrap().catch(async (error) => {
  logger.error('server.bootstrap.failed', {
    message: error instanceof Error ? error.message : 'Unknown error',
  });
  await prisma.$disconnect();
  process.exit(1);
});
