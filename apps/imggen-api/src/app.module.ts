import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AppConfigModule } from './config/app-config.module';
import { ImgModule } from '@img/img.module';
import { JwtStrategy } from '@core/strategies/jwt.strategy';
import { AppAuthGuard } from '@core/guards/app-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AppConfigModule,
    ImgModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: AppAuthGuard,
    },
  ],
})
export class AppModule {}
