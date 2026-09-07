import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvService, validateEnv } from './env';
import { typeOrmConfigModule } from './db';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigModule()),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class AppConfigModule {}
