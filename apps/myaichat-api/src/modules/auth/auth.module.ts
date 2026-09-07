import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { EnvService } from '@cfg/schema/env.service';
import { UserModule } from '../user/user.module';
import { RefreshToken } from './entities';
import {
  AuthService,
  GithubOauthService,
  JwtService,
  RefreshTokenService,
} from './services';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (envService: EnvService) => ({
        secret: envService.jwtSecret,
        signOptions: { expiresIn: envService.jwtExpiresIn as StringValue },
      }),
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubOauthService, RefreshTokenService, JwtService],
  exports: [AuthService, JwtService, RefreshTokenService],
})
export class AuthModule {}
