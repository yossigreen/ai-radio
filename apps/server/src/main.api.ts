import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { loadConfig } from './platform/config/config';

async function bootstrap(): Promise<void> {
  const config = loadConfig();
  const app = await NestFactory.create(ApiModule);
  // Runs onApplicationShutdown hooks (closing the DB pool) on SIGTERM/SIGINT.
  app.enableShutdownHooks();
  await app.listen(config.apiPort);
}

void bootstrap();
