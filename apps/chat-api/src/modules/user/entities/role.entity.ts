import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @ApiProperty({ description: 'Role unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Role name', example: 'admin' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ description: 'Role description', required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'Users with this role', type: () => [User] })
  @OneToMany(() => User, (user) => user.role)
  users: Relation<User[]>;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
