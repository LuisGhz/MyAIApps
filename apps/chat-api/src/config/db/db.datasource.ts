import { ConfigModule } from '@nestjs/config';
import { typeormConfig } from './db.typeorm';
import { DataSource } from 'typeorm';

ConfigModule.forRoot({
  isGlobal: true,
  load: [typeormConfig],
});
export default new DataSource({
  ...typeormConfig(),
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../**/migrations/*.{ts,js}'],
} as any);
