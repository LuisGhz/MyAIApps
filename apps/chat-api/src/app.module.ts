import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from '@cfg/app-config.module';
import { AuthModule } from '@auth/auth.module';
import { UserModule } from '@usr/user.module';
import { CommonModule } from '@cmn/common.module';
import { ChatModule } from '@chat/chat.module';
import { PromptsModule } from '@prompts/prompts.module';
import { ModelsModule } from '@models/models.module';
import { S3Module } from '@s3/s3.module';
import { EnvService } from '@cfg/schema/env.service';

@Module({
  imports: [
    AppConfigModule,
    CommonModule,
    AuthModule,
    UserModule,
    ChatModule,
    PromptsModule,
    ModelsModule,
    S3Module,
    ThrottlerModule.forRootAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        const throttle = envService.throttle;
        return [
          {
            ttl: throttle.ttl,
            limit: throttle.limit,
          },
        ];
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
