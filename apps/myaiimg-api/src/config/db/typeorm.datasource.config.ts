import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { validateEnv } from '../env';

config();

const env = validateEnv(process.env);

export const typeOrmDataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../**/migrations/*{.ts,.js}'],
  migrationsRun: false,
};

export default new DataSource(typeOrmDataSourceConfig);
