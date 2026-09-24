import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './schema/env.schema';
import { EnvService } from './schema/env.service';
import { typeormConfig } from './db/db.typeorm';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [typeormConfig],
    }),
    TypeOrmModule.forRoot(typeormConfig()),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class AppConfigModule {}
