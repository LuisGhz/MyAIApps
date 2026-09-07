import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './services';
import {
  GetAllRolesResDto,
  GetAllUsersResDto,
  UpdateUserRoleReqDto,
  UpdateUserRoleResDto,
} from './dto';
import type { JwtPayload } from '@cmn/interfaces';

const userServiceMock = {
  findAll: jest.fn(),
  findAllRoles: jest.fn(),
  updateUserRole: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let userServiceInstance: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userServiceInstance = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          ghLogin: 'user1',
          name: 'User One',
          email: 'user1@example.com',
          avatar: 'avatar1.jpg',
          role: { id: 'role1', name: 'admin' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          ghLogin: 'user2',
          name: 'User Two',
          email: 'user2@example.com',
          avatar: 'avatar2.jpg',
          role: { id: 'role2', name: 'guest' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      userServiceMock.findAll.mockResolvedValue(mockUsers);

      const result: GetAllUsersResDto = await controller.getAllUsers();

      expect(result).toEqual({ users: mockUsers });
      expect(userServiceInstance.findAll).toHaveBeenCalledTimes(1);
      expect(userServiceInstance.findAll).toHaveBeenCalledWith();
    });
  });

  describe('getAllRoles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: 'role1', name: 'admin' },
        { id: 'role2', name: 'guest' },
      ];

      userServiceMock.findAllRoles.mockResolvedValue(mockRoles);

      const result: GetAllRolesResDto = await controller.getAllRoles();

      expect(result).toEqual({ roles: mockRoles });
      expect(userServiceInstance.findAllRoles).toHaveBeenCalledTimes(1);
      expect(userServiceInstance.findAllRoles).toHaveBeenCalledWith();
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const dto: UpdateUserRoleReqDto = {
        roleId: 'role2',
      };
      const currentUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      userServiceMock.updateUserRole.mockResolvedValue({
        id: userId,
        ghLogin: 'user1',
        name: 'User One',
        role: { id: 'role2', name: 'guest' },
      });

      const result: UpdateUserRoleResDto = await controller.updateUserRole(
        userId,
        dto,
        currentUser,
      );

      expect(result).toEqual({ message: 'User role updated successfully' });
      expect(userServiceInstance.updateUserRole).toHaveBeenCalledTimes(1);
      expect(userServiceInstance.updateUserRole).toHaveBeenCalledWith(
        userId,
        dto.roleId,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users exist', async () => {
      userServiceMock.findAll.mockResolvedValue([]);

      const result: GetAllUsersResDto = await controller.getAllUsers();

      expect(result).toEqual({ users: [] });
      expect(userServiceInstance.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllRoles', () => {
    it('should return empty array when no roles exist', async () => {
      userServiceMock.findAllRoles.mockResolvedValue([]);

      const result: GetAllRolesResDto = await controller.getAllRoles();

      expect(result).toEqual({ roles: [] });
      expect(userServiceInstance.findAllRoles).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserRole', () => {
    it('should throw BadRequestException when user tries to update their own role', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const dto: UpdateUserRoleReqDto = {
        roleId: 'role2',
      };
      const currentUser: JwtPayload = {
        sub: userId,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      await expect(
        controller.updateUserRole(userId, dto, currentUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        controller.updateUserRole(userId, dto, currentUser),
      ).rejects.toThrow("You can't update your own role");
      expect(userServiceInstance.updateUserRole).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException when user not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const dto: UpdateUserRoleReqDto = {
        roleId: 'role2',
      };
      const currentUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const notFoundError = new Error('User not found');
      userServiceMock.updateUserRole.mockRejectedValue(notFoundError);

      await expect(
        controller.updateUserRole(userId, dto, currentUser),
      ).rejects.toThrow(notFoundError);
      expect(userServiceInstance.updateUserRole).toHaveBeenCalledTimes(1);
    });

    it('should propagate NotFoundException when role not found', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const dto: UpdateUserRoleReqDto = {
        roleId: 'invalid-role-id',
      };
      const currentUser: JwtPayload = {
        sub: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      };

      const notFoundError = new Error('Role not found');
      userServiceMock.updateUserRole.mockRejectedValue(notFoundError);

      await expect(
        controller.updateUserRole(userId, dto, currentUser),
      ).rejects.toThrow(notFoundError);
      expect(userServiceInstance.updateUserRole).toHaveBeenCalledTimes(1);
      expect(userServiceInstance.updateUserRole).toHaveBeenCalledWith(
        userId,
        dto.roleId,
      );
    });
  });
});
