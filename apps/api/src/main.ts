import './load-env.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { startWorkflowWorker } from './workflow.worker.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  startWorkflowWorker();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();