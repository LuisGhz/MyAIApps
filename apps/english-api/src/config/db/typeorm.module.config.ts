import { registerAs } from '@nestjs/config';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';
import { EnvService } from '../env.service';

export const typeOrmModuleConfig = registerAs(
  'typeorm',
  (): TypeOrmModuleAsyncOptions => ({
    inject: [EnvService],
    useFactory: (envService: EnvService): TypeOrmModuleOptions => ({
      type: 'postgres',
      host: envService.dbHost,
      port: envService.dbPort,
      username: envService.dbUsername,
      password: envService.dbPassword,
      database: envService.dbName,
      autoLoadEntities: true,
      logging: envService.nodeEnv === 'development',
      synchronize: false,
      migrationsRun: false,
    }),
  }),
);
