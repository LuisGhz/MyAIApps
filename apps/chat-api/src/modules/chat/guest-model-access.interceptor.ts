import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { ModelsService } from '@mdl/services';
import type { JwtPayload } from '@cmn/interfaces';
import type { Observable } from 'rxjs';

@Injectable()
export class GuestModelAccessInterceptor implements NestInterceptor {
  constructor(private readonly modelsService: ModelsService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload;
      body?: { modelId?: string };
    }>();
    const user = request.user;
    const modelId = request.body?.modelId;

    if (user?.role === 'guest' && modelId) {
      await this.modelsService.validateGuestAccessById(modelId, user.role);
    }

    return next.handle();
  }
}
