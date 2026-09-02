import './crypto-polyfill';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'node:path';

import { configProvider } from './app.config.provider';
import { FilmsController } from './films/films.controller';
import { FilmsService } from './films/films.service';
import { FilmsRepository } from './films/films.repository';
import { Film } from './films/entities/film.entity';
import { Schedule } from './films/entities/schedule.entity';
import { OrderController } from './order/order.controller';
import { OrderService } from './order/order.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = new URL(
          configService.get<string>('DATABASE_URL') ??
            'postgres://localhost:5432/films',
        );

        return {
          type: 'postgres',
          host: databaseUrl.hostname,
          port: Number(databaseUrl.port || 5432),
          database: databaseUrl.pathname.slice(1),
          username:
            configService.get<string>('DATABASE_USERNAME') ||
            databaseUrl.username,
          password:
            configService.get<string>('DATABASE_PASSWORD') ||
            databaseUrl.password,
          entities: [Film, Schedule],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([Film, Schedule]),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [configProvider, FilmsService, FilmsRepository, OrderService],
})
export class AppModule {}
