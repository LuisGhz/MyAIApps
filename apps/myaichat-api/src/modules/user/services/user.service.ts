import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, User } from '../entities';

export interface CreateUserData {
  ghLogin: string;
  name?: string;
  avatar?: string;
  email?: string;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findByGhLogin(ghLogin: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { ghLogin },
      relations: ['role'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async create(data: CreateUserData): Promise<User> {
    const userCount = await this.userRepository.count();
    const isFirstUser = userCount === 0;

    const roleName = isFirstUser ? 'admin' : 'guest';
    const assignedRole = await this.roleRepository.findOne({
      where: { name: roleName },
    });

    if (!assignedRole) {
      throw new Error(`Role "${roleName}" not found. Ensure roles are seeded.`);
    }

    const user = this.userRepository.create({
      ghLogin: data.ghLogin,
      name: data.name || data.ghLogin,
      avatar: data.avatar,
      email: data.email,
      role: assignedRole,
    });

    return this.userRepository.save(user);
  }

  async update(id: string, data: Partial<CreateUserData>): Promise<User> {
    await this.userRepository.update(id, data);
    const user = await this.findById(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async findOrCreate(data: CreateUserData): Promise<User> {
    const existingUser = await this.findByGhLogin(data.ghLogin);

    if (existingUser) {
      return this.update(existingUser.id, {
        name: data.name || existingUser.name,
        avatar: data.avatar || existingUser.avatar,
        email: data.email || existingUser.email,
      });
    }

    return this.create(data);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['role'],
    });
  }

  async updateUserRole(userId: string, roleId: string): Promise<User> {
    const user = await this.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) throw new NotFoundException(`Role with id ${roleId} not found`);

    user.role = role;
    return this.userRepository.save(user);
  }

  async findAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      select: ['id', 'name'],
    });
  }
}
