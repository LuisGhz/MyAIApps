import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@auth/services';
import { RefreshTokenService } from '@auth/services/refresh-token.service';
import { COOKIE_REFRESH_TOKEN } from '@auth/const/cookies.const';
import { TokenExpiredError } from '@nestjs/jwt';
import { PUBLIC_KEY, ADMIN_ROLE_KEY } from '@cmn/decorators';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '@cmn/interfaces';

const NEW_ACCESS_TOKEN_HEADER = 'x-new-access-token';

@Injectable()
export class JwtGuard implements CanActivate {
  readonly #logger = new Logger(JwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const shouldBeAdmin = this.reflector.getAllAndOverride<boolean>(
      ADMIN_ROLE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer '))
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );

    const token = authHeader.split(' ')[1];

    try {
      const payload = this.jwtService.verify(token);
      if (shouldBeAdmin) this.#validateAdminRole(payload);
      request['user'] = payload;
      return true;
    } catch (error) {
      if (!(error instanceof TokenExpiredError)) return false;
      if (shouldBeAdmin) this.#validateAdminRole(this.jwtService.decode(token));
      return await this.#handleExpiredToken(token, request, response);
    }
  }

  async #handleExpiredToken(
    token: string,
    request: Request,
    response: Response,
  ): Promise<boolean> {
    const refreshToken = request.cookies[COOKIE_REFRESH_TOKEN];

    if (!refreshToken)
      throw new UnauthorizedException('Invalid or missing refresh token');

    const validRefreshToken =
      await this.refreshTokenService.findValidByToken(refreshToken);

    if (!validRefreshToken)
      throw new UnauthorizedException('Invalid or expired refresh token');

    try {
      const decodedToken = this.jwtService.decode(token);

      const newAccessToken = this.jwtService.signWithPreviousToken(token);
      response.setHeader(
        'Access-Control-Expose-Headers',
        NEW_ACCESS_TOKEN_HEADER,
      );
      response.setHeader(NEW_ACCESS_TOKEN_HEADER, newAccessToken);

      request['user'] = decodedToken;

      return true;
    } catch (error) {
      this.#logger.error('Failed to refresh token', error);
      throw new UnauthorizedException('Failed to refresh token');
    }
  }

  #validateAdminRole(payload: JwtPayload) {
    if (payload.role !== 'admin') {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
