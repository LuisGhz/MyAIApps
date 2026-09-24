import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User, Role } from '../entities';

const userRepositoryMock = {
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const roleRepositoryMock = {
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;
  let userRepositoryInstance: Repository<User>;
  let roleRepositoryInstance: Repository<Role>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(Role),
          useValue: roleRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepositoryInstance = module.get<Repository<User>>(
      getRepositoryToken(User),
    );
    roleRepositoryInstance = module.get<Repository<Role>>(
      getRepositoryToken(Role),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user by GitHub login', async () => {
    const mockUser = {
      id: '1',
      ghLogin: 'testuser',
      name: 'Test User',
      role: { id: '1', name: 'user' },
    } as User;
    userRepositoryMock.findOne.mockResolvedValue(mockUser);

    const result = await service.findByGhLogin('testuser');

    expect(result).toEqual(mockUser);
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { ghLogin: 'testuser' },
      relations: ['role'],
    });
  });

  it('should find a user by id', async () => {
    const mockUser = {
      id: '123',
      ghLogin: 'testuser',
      name: 'Test User',
      role: { id: '1', name: 'user' },
    } as User;
    userRepositoryMock.findOne.mockResolvedValue(mockUser);

    const result = await service.findById('123');

    expect(result).toEqual(mockUser);
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: '123' },
      relations: ['role'],
    });
  });

  it('should create a new user with guest role when not first user', async () => {
    const userData = {
      ghLogin: 'newuser',
      name: 'New User',
      avatar: 'https://example.com/avatar.png',
      email: 'newuser@example.com',
    };
    const mockRole = { id: '2', name: 'guest' } as Role;
    const mockUser = { ...userData, id: '456', role: mockRole } as User;

    userRepositoryMock.count.mockResolvedValue(5);
    roleRepositoryMock.findOne.mockResolvedValue(mockRole);
    userRepositoryMock.create.mockReturnValue(mockUser);
    userRepositoryMock.save.mockResolvedValue(mockUser);

    const result = await service.create(userData);

    expect(result).toEqual(mockUser);
    expect(userRepositoryMock.count).toHaveBeenCalled();
    expect(roleRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { name: 'guest' },
    });
    expect(userRepositoryMock.create).toHaveBeenCalledWith({
      ghLogin: userData.ghLogin,
      name: userData.name,
      avatar: userData.avatar,
      email: userData.email,
      role: mockRole,
    });
    expect(userRepositoryMock.save).toHaveBeenCalledWith(mockUser);
  });

  it('should create first user with admin role', async () => {
    const userData = {
      ghLogin: 'firstuser',
      name: 'First User',
    };
    const mockRole = { id: '1', name: 'admin' } as Role;
    const mockUser = { ...userData, id: '1', role: mockRole } as User;

    userRepositoryMock.count.mockResolvedValue(0);
    roleRepositoryMock.findOne.mockResolvedValue(mockRole);
    userRepositoryMock.create.mockReturnValue(mockUser);
    userRepositoryMock.save.mockResolvedValue(mockUser);

    const result = await service.create(userData);

    expect(result).toEqual(mockUser);
    expect(roleRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { name: 'admin' },
    });
  });

  it('should update user successfully', async () => {
    const userId = '123';
    const updateData = {
      name: 'Updated Name',
      avatar: 'https://example.com/new-avatar.png',
    };
    const updatedUser = {
      id: userId,
      ghLogin: 'testuser',
      ...updateData,
      role: { id: '1', name: 'user' },
    } as User;

    userRepositoryMock.update.mockResolvedValue({ affected: 1 });
    userRepositoryMock.findOne.mockResolvedValue(updatedUser);

    const result = await service.update(userId, updateData);

    expect(result).toEqual(updatedUser);
    expect(userRepositoryMock.update).toHaveBeenCalledWith(userId, updateData);
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: userId },
      relations: ['role'],
    });
  });

  it('should find existing user and update in findOrCreate', async () => {
    const userData = {
      ghLogin: 'existinguser',
      name: 'Updated Name',
      avatar: 'https://example.com/new-avatar.png',
    };
    const existingUser = {
      id: '789',
      ghLogin: 'existinguser',
      name: 'Old Name',
      avatar: 'https://example.com/old-avatar.png',
      role: { id: '1', name: 'user' },
    } as User;
    const updatedUser = { ...existingUser, ...userData } as User;

    userRepositoryMock.findOne
      .mockResolvedValueOnce(existingUser)
      .mockResolvedValueOnce(updatedUser);
    userRepositoryMock.update.mockResolvedValue({ affected: 1 });

    const result = await service.findOrCreate(userData);

    expect(result).toEqual(updatedUser);
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { ghLogin: 'existinguser' },
      relations: ['role'],
    });
    expect(userRepositoryMock.update).toHaveBeenCalledWith(existingUser.id, {
      name: userData.name,
      avatar: userData.avatar,
      email: undefined,
    });
  });

  it('should create new user when not found in findOrCreate', async () => {
    const userData = {
      ghLogin: 'newuser',
      name: 'New User',
    };
    const mockRole = { id: '2', name: 'guest' } as Role;
    const newUser = { ...userData, id: '999', role: mockRole } as User;

    userRepositoryMock.findOne.mockResolvedValue(null);
    userRepositoryMock.count.mockResolvedValue(3);
    roleRepositoryMock.findOne.mockResolvedValue(mockRole);
    userRepositoryMock.create.mockReturnValue(newUser);
    userRepositoryMock.save.mockResolvedValue(newUser);

    const result = await service.findOrCreate(userData);

    expect(result).toEqual(newUser);
    expect(userRepositoryMock.save).toHaveBeenCalledWith(newUser);
  });

  it('should find all users', async () => {
    const mockUsers = [
      { id: '1', ghLogin: 'user1', role: { id: '1', name: 'admin' } },
      { id: '2', ghLogin: 'user2', role: { id: '2', name: 'user' } },
    ] as User[];
    userRepositoryMock.find.mockResolvedValue(mockUsers);

    const result = await service.findAll();

    expect(result).toEqual(mockUsers);
    expect(userRepositoryMock.find).toHaveBeenCalledWith({
      relations: ['role'],
    });
  });

  it('should update user role successfully', async () => {
    const userId = '123';
    const roleId = '456';
    const mockUser = {
      id: userId,
      ghLogin: 'testuser',
      role: { id: '1', name: 'user' },
    } as User;
    const newRole = { id: roleId, name: 'admin' } as Role;
    const updatedUser = { ...mockUser, role: newRole } as User;

    userRepositoryMock.findOne.mockResolvedValue(mockUser);
    roleRepositoryMock.findOne.mockResolvedValue(newRole);
    userRepositoryMock.save.mockResolvedValue(updatedUser);

    const result = await service.updateUserRole(userId, roleId);

    expect(result).toEqual(updatedUser);
    expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: userId },
      relations: ['role'],
    });
    expect(roleRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: roleId },
    });
    expect(userRepositoryMock.save).toHaveBeenCalledWith(updatedUser);
  });

  it('should find all roles', async () => {
    const mockRoles = [
      { id: '1', name: 'admin' },
      { id: '2', name: 'user' },
      { id: '3', name: 'guest' },
    ] as Role[];
    roleRepositoryMock.find.mockResolvedValue(mockRoles);

    const result = await service.findAllRoles();

    expect(result).toEqual(mockRoles);
    expect(roleRepositoryMock.find).toHaveBeenCalledWith({
      select: ['id', 'name'],
    });
  });
});
