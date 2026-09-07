import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../entities';

@Injectable()
export class RoleSeedService implements OnModuleInit {
  private readonly logger = new Logger(RoleSeedService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedRoles();
  }

  private async seedRoles(): Promise<void> {
    const count = await this.roleRepository.count();

    if (count > 0) {
      this.logger.log('Roles already seeded, skipping...');
      return;
    }

    const roles: Partial<Role>[] = [
      { name: 'user', description: 'Default user role' },
      { name: 'admin', description: 'Administrator role with full access' },
      { name: 'guest', description: 'Role with limited access' },
    ];

    await this.roleRepository.save(roles);
    this.logger.log('Roles seeded successfully: user, admin, guest');
  }
}
