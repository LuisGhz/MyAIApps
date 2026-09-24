import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from '../entities';
import { User } from '../../user/entities';
import { EnvService } from '@cfg/schema/env.service';

const refreshTokenRepositoryMock = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  count: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const envServiceMock = {
  refreshTokenLength: 32,
  refreshTokenExpiresIn: '7d',
};

describe('RefreshTokenService', () => {
  let refreshTokenService: RefreshTokenService;
  let refreshTokenRepositoryInstance: Repository<RefreshToken>;
  let envServiceInstance: EnvService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: refreshTokenRepositoryMock,
        },
        {
          provide: EnvService,
          useValue: envServiceMock,
        },
      ],
    }).compile();

    refreshTokenService = module.get<RefreshTokenService>(RefreshTokenService);
    refreshTokenRepositoryInstance = module.get<Repository<RefreshToken>>(
      getRepositoryToken(RefreshToken),
    );
    envServiceInstance = module.get<EnvService>(EnvService);
  });

  it('should create and save a refresh token', async () => {
    const user = { id: 'user-id', name: 'Test User' } as User;
    const agentInfo = 'Mozilla/5.0';
    const mockToken = {
      id: 'token-id',
      user,
      token: 'generated-token',
      exp: new Date('2025-12-21'),
      agentInfo,
      isRevoked: false,
    } as RefreshToken;
    refreshTokenRepositoryMock.create.mockReturnValue(mockToken);
    refreshTokenRepositoryMock.save.mockResolvedValue(mockToken);

    const result = await refreshTokenService.create(user, agentInfo);

    expect(result).toEqual(mockToken);
    expect(refreshTokenRepositoryMock.create).toHaveBeenCalledWith({
      user,
      token: expect.any(String),
      exp: expect.any(Date),
      agentInfo,
      isRevoked: false,
    });
    expect(refreshTokenRepositoryMock.save).toHaveBeenCalledWith(mockToken);
    expect(refreshTokenRepositoryMock.create).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should find a refresh token by token string', async () => {
    const token = 'refresh-token-string';
    const mockRefreshToken = {
      id: 'token-id',
      token,
      user: { id: 'user-id' },
      isRevoked: false,
    } as RefreshToken;
    refreshTokenRepositoryMock.findOne.mockResolvedValue(mockRefreshToken);

    const result = await refreshTokenService.findByToken(token);

    expect(result).toEqual(mockRefreshToken);
    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { token },
      relations: ['user', 'user.role'],
    });
    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledTimes(1);
  });

  it('should find a valid refresh token by token string', async () => {
    const token = 'valid-refresh-token';
    const mockRefreshToken = {
      id: 'token-id',
      token,
      user: { id: 'user-id' },
      isRevoked: false,
      exp: new Date('2025-12-21'),
    } as RefreshToken;
    refreshTokenRepositoryMock.findOne.mockResolvedValue(mockRefreshToken);

    const result = await refreshTokenService.findValidByToken(token);

    expect(result).toEqual(mockRefreshToken);
    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        token,
        isRevoked: false,
        exp: MoreThan(expect.any(Date)),
      },
      relations: ['user', 'user.role'],
    });
    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledTimes(1);
  });

  it('should revoke a refresh token by token string', async () => {
    const token = 'token-to-revoke';
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 1 });

    await refreshTokenService.revoke(token);

    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { token },
      { isRevoked: true },
    );
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should revoke a refresh token by id', async () => {
    const id = 'token-id-to-revoke';
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 1 });

    await refreshTokenService.revokeById(id);

    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { id },
      { isRevoked: true },
    );
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should count active sessions for a user', async () => {
    const userId = 'user-id';
    const expectedCount = 3;
    refreshTokenRepositoryMock.count.mockResolvedValue(expectedCount);

    const result = await refreshTokenService.countActiveSessions(userId);

    expect(result).toBe(expectedCount);
    expect(refreshTokenRepositoryMock.count).toHaveBeenCalledWith({
      where: {
        user: { id: userId },
        isRevoked: false,
        exp: MoreThan(expect.any(Date)),
      },
    });
    expect(refreshTokenRepositoryMock.count).toHaveBeenCalledTimes(1);
  });

  it('should revoke oldest session for a user', async () => {
    const userId = 'user-id';
    const oldestSession = {
      id: 'oldest-token-id',
      createdAt: new Date('2025-01-01'),
    } as RefreshToken;
    refreshTokenRepositoryMock.findOne.mockResolvedValue(oldestSession);
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 1 });

    await refreshTokenService.revokeOldestSession(userId);

    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: userId },
        isRevoked: false,
        exp: MoreThan(expect.any(Date)),
      },
      order: { createdAt: 'ASC' },
    });
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { id: oldestSession.id },
      { isRevoked: true },
    );
  });

  it('should clean expired tokens', async () => {
    refreshTokenRepositoryMock.delete.mockResolvedValue({ affected: 5 });

    await refreshTokenService.cleanExpiredTokens();

    expect(refreshTokenRepositoryMock.delete).toHaveBeenCalledWith({
      exp: LessThan(expect.any(Date)),
    });
    expect(refreshTokenRepositoryMock.delete).toHaveBeenCalledTimes(1);
  });

  it('should revoke all user sessions', async () => {
    const userId = 'user-id';
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 3 });

    await refreshTokenService.revokeAllUserSessions(userId);

    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should return null when token is not found', async () => {
    const token = 'non-existent-token';
    refreshTokenRepositoryMock.findOne.mockResolvedValue(null);

    const result = await refreshTokenService.findByToken(token);

    expect(result).toBeNull();
    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { token },
      relations: ['user', 'user.role'],
    });
  });

  it('should return null when valid token is not found', async () => {
    const token = 'invalid-or-expired-token';
    refreshTokenRepositoryMock.findOne.mockResolvedValue(null);

    const result = await refreshTokenService.findValidByToken(token);

    expect(result).toBeNull();
    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        token,
        isRevoked: false,
        exp: MoreThan(expect.any(Date)),
      },
      relations: ['user', 'user.role'],
    });
  });

  it('should handle revokeOldestSession when no active session exists', async () => {
    const userId = 'user-with-no-sessions';
    refreshTokenRepositoryMock.findOne.mockResolvedValue(null);

    await refreshTokenService.revokeOldestSession(userId);

    expect(refreshTokenRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: userId },
        isRevoked: false,
        exp: MoreThan(expect.any(Date)),
      },
      order: { createdAt: 'ASC' },
    });
    expect(refreshTokenRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('should return zero when user has no active sessions', async () => {
    const userId = 'user-with-no-sessions';
    refreshTokenRepositoryMock.count.mockResolvedValue(0);

    const result = await refreshTokenService.countActiveSessions(userId);

    expect(result).toBe(0);
    expect(refreshTokenRepositoryMock.count).toHaveBeenCalledWith({
      where: {
        user: { id: userId },
        isRevoked: false,
        exp: MoreThan(expect.any(Date)),
      },
    });
  });

  it('should handle cleanExpiredTokens when no expired tokens exist', async () => {
    refreshTokenRepositoryMock.delete.mockResolvedValue({ affected: 0 });

    await refreshTokenService.cleanExpiredTokens();

    expect(refreshTokenRepositoryMock.delete).toHaveBeenCalledWith({
      exp: LessThan(expect.any(Date)),
    });
    expect(refreshTokenRepositoryMock.delete).toHaveBeenCalledTimes(1);
  });

  it('should handle revokeAllUserSessions when user has no active sessions', async () => {
    const userId = 'user-with-no-sessions';
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 0 });

    await refreshTokenService.revokeAllUserSessions(userId);

    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should handle revoke when token does not exist', async () => {
    const token = 'non-existent-token';
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 0 });

    await refreshTokenService.revoke(token);

    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { token },
      { isRevoked: true },
    );
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledTimes(1);
  });

  it('should handle revokeById when token id does not exist', async () => {
    const id = 'non-existent-id';
    refreshTokenRepositoryMock.update.mockResolvedValue({ affected: 0 });

    await refreshTokenService.revokeById(id);

    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledWith(
      { id },
      { isRevoked: true },
    );
    expect(refreshTokenRepositoryMock.update).toHaveBeenCalledTimes(1);
  });
});
