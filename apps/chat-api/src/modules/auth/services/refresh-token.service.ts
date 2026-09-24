import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import * as crypto from 'node:crypto';
import { RefreshToken } from '../entities';
import { User } from '../../user/entities';
import { EnvService } from '@cfg/schema/env.service';
import { parseExpiration } from '../helpers';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly envService: EnvService,
  ) {}

  async create(user: User, agentInfo: string): Promise<RefreshToken> {
    const token = crypto
      .randomBytes(this.envService.refreshTokenLength)
      .toString('hex');
    const exp = parseExpiration(this.envService.refreshTokenExpiresIn);

    const refreshToken = this.refreshTokenRepository.create({
      user,
      token,
      exp,
      agentInfo,
      isRevoked: false,
    });

    return this.refreshTokenRepository.save(refreshToken);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: { token },
      relations: ['user', 'user.role'],
    });
  }

  async findValidByToken(token: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepository.findOne({
      where: {
        token,
        isRevoked: false,
        exp: MoreThan(new Date()),
      },
      relations: ['user', 'user.role'],
    });
  }

  async revoke(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  async revokeById(id: string): Promise<void> {
    await this.refreshTokenRepository.update({ id }, { isRevoked: true });
  }

  async countActiveSessions(userId: string): Promise<number> {
    return this.refreshTokenRepository.count({
      where: {
        user: { id: userId },
        isRevoked: false,
        exp: MoreThan(new Date()),
      },
    });
  }

  async revokeOldestSession(userId: string): Promise<void> {
    const oldestSession = await this.refreshTokenRepository.findOne({
      where: {
        user: { id: userId },
        isRevoked: false,
        exp: MoreThan(new Date()),
      },
      order: { createdAt: 'ASC' },
    });

    if (oldestSession) {
      await this.revokeById(oldestSession.id);
    }
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository.delete({
      exp: LessThan(new Date()),
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { user: { id: userId }, isRevoked: false },
      { isRevoked: true },
    );
  }
}
