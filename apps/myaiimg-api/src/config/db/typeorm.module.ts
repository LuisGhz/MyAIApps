import { registerAs } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { EnvService } from '../env';

export const typeOrmConfigModule = registerAs(
  'typeorm',
  (): TypeOrmModuleAsyncOptions => ({
    inject: [EnvService],
    useFactory: (envService: EnvService) => ({
      type: 'postgres',
      host: envService.dbHost,
      port: envService.dbPort,
      username: envService.dbUsername,
      password: envService.dbPassword,
      database: envService.dbName,
      synchronize: false,
      logging: envService.nodeEnv !== 'production',
      autoLoadEntities: true,
      migrationsRun: false,
    }),
  }),
);
