import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleSeedService } from './role-seed.service';
import { Role } from '../entities';

const roleRepositoryMock = {
  count: jest.fn(),
  save: jest.fn(),
};

describe('RoleSeedService', () => {
  let service: RoleSeedService;
  let roleRepositoryInstance: Repository<Role>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleSeedService,
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<RoleSeedService>(RoleSeedService);
    roleRepositoryInstance = module.get<Repository<Role>>(
      getRepositoryToken(Role),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should seed roles when no roles exist', async () => {
    roleRepositoryMock.count.mockResolvedValue(0);
    roleRepositoryMock.save.mockResolvedValue([]);

    await service.onModuleInit();

    expect(roleRepositoryMock.count).toHaveBeenCalled();
    expect(roleRepositoryMock.save).toHaveBeenCalledWith([
      { name: 'user', description: 'Default user role' },
      { name: 'admin', description: 'Administrator role with full access' },
      { name: 'guest', description: 'Role with limited access' },
    ]);
  });

  it('should skip seeding when roles already exist', async () => {
    roleRepositoryMock.count.mockResolvedValue(3);

    await service.onModuleInit();

    expect(roleRepositoryMock.count).toHaveBeenCalled();
    expect(roleRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should call onModuleInit automatically', async () => {
    roleRepositoryMock.count.mockResolvedValue(0);
    roleRepositoryMock.save.mockResolvedValue([]);

    await service.onModuleInit();

    expect(roleRepositoryMock.count).toHaveBeenCalledTimes(1);
  });
});
