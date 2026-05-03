import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { AppModule } from './app.module.js';

process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

const cwd = process.cwd();
dotenv.config({
  path: [path.resolve(cwd, '.env'), path.resolve(cwd, '.env.shared')],
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { rawBody: true },
  );
  // app.useBodyParser('application/json');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const documentConfig = new DocumentBuilder()
    .setTitle('MyAI RAG Notebook')
    .setDescription('REST API for MyAI RAG Notebook')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('/api', app, () =>
    SwaggerModule.createDocument(app, documentConfig),
  );

  app.setGlobalPrefix('/api');
  app.enableShutdownHooks();
  await app.listen(process.env['PORT'] || 3000, '0.0.0.0');
}

void bootstrap();
