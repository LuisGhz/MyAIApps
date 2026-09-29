import { ConfigModule } from '@nestjs/config';
import { typeormConfig } from './db.typeorm';
import { DataSource, type DataSourceOptions } from 'typeorm';

void ConfigModule.forRoot({
  isGlobal: true,
  load: [typeormConfig],
});

const { host, port, username, password, synchronize, logging, migrationsRun } =
  typeormConfig() as Extract<DataSourceOptions, { type: 'postgres' }>;
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host,
  port,
  username,
  password,
  database: process.env.DB_NAME,
  synchronize,
  logging,
  migrationsRun,
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../**/migrations/*.{ts,js}'],
};

export default new DataSource(dataSourceOptions);
