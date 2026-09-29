import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@cmn/interfaces';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
