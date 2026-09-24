import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeormConfig = registerAs(
  'typeorm',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT!, 10) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    migrationsRun: false,
    entities: ['dist/**/*.entity{.js}'],
  }),
);
