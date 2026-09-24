import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnv } from './env.schema';
import { EnvService } from './env.service';
import { typeOrmModuleConfig } from './db/typeorm.module.config';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [typeOrmModuleConfig],
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleConfig()),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class ConfigModule {}
