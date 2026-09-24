import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const userRepositoryMock = {
      create: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
    } as Partial<jest.Mocked<Repository<User>>> as jest.Mocked<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('finds a user by email', async () => {
    const user = {
      email: 'luis@example.com',
      fullName: 'Luis Gtz',
      id: 'user-1',
      password: 'hashed-password',
    } as User;

    userRepository.findOneBy.mockResolvedValue(user);

    await expect(service.findByEmail(user.email)).resolves.toEqual(user);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: user.email });
  });

  it('finds a user by id', async () => {
    const user = {
      email: 'luis@example.com',
      fullName: 'Luis Gtz',
      id: 'user-1',
      password: 'hashed-password',
    } as User;

    userRepository.findOneBy.mockResolvedValue(user);

    await expect(service.findById(user.id)).resolves.toEqual(user);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
  });

  it('creates and saves a user', async () => {
    const data = {
      email: 'luis@example.com',
      fullName: 'Luis Gtz',
      password: 'hashed-password',
    };
    const entity = {
      ...data,
      id: 'user-1',
    } as User;

    userRepository.create.mockReturnValue(entity);
    userRepository.save.mockResolvedValue(entity);

    await expect(service.create(data)).resolves.toEqual(entity);
    expect(userRepository.create).toHaveBeenCalledWith(data);
    expect(userRepository.save).toHaveBeenCalledWith(entity);
  });
});