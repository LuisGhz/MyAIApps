import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModelsService } from '@mdl/services';
import type { JwtPayload } from '@cmn/interfaces';

@Injectable()
export class GuestModelAccessGuard implements CanActivate {
  constructor(private readonly modelsService: ModelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: JwtPayload | null;
      body?: { modelId?: string | null };
    }>();

    const modelId = request.body?.modelId;
    const user = request.user;
    if (user?.role !== 'guest' || !modelId) return true;

    await this.modelsService.validateGuestAccessById(modelId, user.role);

    return true;
  }
}
