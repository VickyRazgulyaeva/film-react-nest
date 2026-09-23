import './crypto-polyfill';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TskvLogger } from './logger/tskv.logger';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  app.useLogger(new TskvLogger());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
