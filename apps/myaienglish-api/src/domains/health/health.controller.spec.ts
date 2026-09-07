import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  type HealthIndicatorFunction,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: jest.Mocked<HealthCheckService>;
  let typeOrmHealthIndicator: jest.Mocked<TypeOrmHealthIndicator>;

  beforeEach(async () => {
    const healthCheckServiceMock = {
      check: jest.fn(),
    } as Partial<jest.Mocked<HealthCheckService>> as jest.Mocked<HealthCheckService>;
    const typeOrmHealthIndicatorMock = {
      pingCheck: jest.fn(),
    } as Partial<jest.Mocked<TypeOrmHealthIndicator>> as jest.Mocked<TypeOrmHealthIndicator>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: healthCheckServiceMock,
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: typeOrmHealthIndicatorMock,
        },
      ],
    }).compile();

    controller = module.get(HealthController);
    healthCheckService = module.get(HealthCheckService);
    typeOrmHealthIndicator = module.get(TypeOrmHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('runs the database health indicator through the health check service', async () => {
    const result = {
      info: {
        database: {
          status: 'up',
        },
      },
      status: 'ok',
    };

    healthCheckService.check.mockResolvedValue(result as never);
    typeOrmHealthIndicator.pingCheck.mockResolvedValue(result.info as never);

    await expect(controller.check()).resolves.toEqual(result);
    expect(healthCheckService.check).toHaveBeenCalledTimes(1);

    const indicators =
      healthCheckService.check.mock.calls[0][0] as HealthIndicatorFunction[];
    await indicators[0]();

    expect(typeOrmHealthIndicator.pingCheck).toHaveBeenCalledWith('database');
  });
});