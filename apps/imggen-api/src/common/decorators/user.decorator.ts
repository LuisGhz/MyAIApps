import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@core/strategies/interfaces';

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
