import { NestFactory } from '@nestjs/core';
import { RequestMethod } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/afisha', {
    exclude: [{ path: 'order', method: RequestMethod.ALL }],
  });
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
