import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { ModelsService } from '@mdl/services';
import { GuestModelAccessInterceptor } from './guest-model-access.interceptor';

describe('GuestModelAccessInterceptor', () => {
  let interceptor: GuestModelAccessInterceptor;
  let modelsService: jest.Mocked<ModelsService>;
  let validateGuestAccessByIdMock: jest.MockedFunction<
    ModelsService['validateGuestAccessById']
  >;

  beforeEach(() => {
    validateGuestAccessByIdMock = jest.fn().mockResolvedValue(undefined);
    modelsService = {
      validateGuestAccessById: validateGuestAccessByIdMock,
    } as unknown as jest.Mocked<ModelsService>;
    interceptor = new GuestModelAccessInterceptor(modelsService);
  });

  it('validates guest access using the parsed multipart modelId', async () => {
    const context = createContext({
      user: { role: 'guest' },
      body: { modelId: 'model-id' },
    });
    const handleMock = jest.fn(() => of('next'));
    const next = { handle: handleMock } as unknown as CallHandler;

    await interceptor.intercept(context, next);

    expect(validateGuestAccessByIdMock.mock.calls).toEqual([
      ['model-id', 'guest'],
    ]);
    expect(handleMock.mock.calls).toHaveLength(1);
  });

  it('does not validate model access for non-guest requests', async () => {
    const context = createContext({
      user: { role: 'user' },
      body: { modelId: 'model-id' },
    });
    const handleMock = jest.fn(() => of('next'));
    const next = { handle: handleMock } as unknown as CallHandler;

    await interceptor.intercept(context, next);

    expect(validateGuestAccessByIdMock.mock.calls).toHaveLength(0);
    expect(handleMock.mock.calls).toHaveLength(1);
  });

  function createContext(request: Record<string, unknown>): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  }
});
