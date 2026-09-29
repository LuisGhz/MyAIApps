import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { ModelsService } from '@mdl/services';
import { GuestModelAccessInterceptor } from './guest-model-access.interceptor';

describe('GuestModelAccessInterceptor', () => {
  let interceptor: GuestModelAccessInterceptor;
  let modelsService: jest.Mocked<ModelsService>;

  beforeEach(() => {
    modelsService = {
      validateGuestAccessById: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ModelsService>;
    interceptor = new GuestModelAccessInterceptor(modelsService);
  });

  it('validates guest access using the parsed multipart modelId', async () => {
    const context = createContext({
      user: { role: 'guest' },
      body: { modelId: 'model-id' },
    });
    const next = { handle: jest.fn(() => of('next')) } as unknown as CallHandler;

    await interceptor.intercept(context, next);

    expect(modelsService.validateGuestAccessById).toHaveBeenCalledWith(
      'model-id',
      'guest',
    );
    expect(next.handle).toHaveBeenCalled();
  });

  it('does not validate model access for non-guest requests', async () => {
    const context = createContext({
      user: { role: 'user' },
      body: { modelId: 'model-id' },
    });
    const next = { handle: jest.fn(() => of('next')) } as unknown as CallHandler;

    await interceptor.intercept(context, next);

    expect(modelsService.validateGuestAccessById).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalled();
  });

  function createContext(request: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }
});