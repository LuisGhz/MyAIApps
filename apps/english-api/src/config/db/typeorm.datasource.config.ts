import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { validateEnv } from '../env.schema';

// Load environment variables for CLI commands
config();

// Validate and parse environment variables
const env = validateEnv(process.env);

// Create DataSource configuration for migrations
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: false,
  migrationsRun: false,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../**/migrations/*{.ts,.js}'],
};

export default new DataSource(dataSourceOptions);
