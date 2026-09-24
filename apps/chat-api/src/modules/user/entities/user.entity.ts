import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'User unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'GitHub username' })
  @Column({ unique: true })
  ghLogin: string;

  @ApiProperty({ description: 'User display name' })
  @Column()
  name: string;

  @ApiProperty({ description: 'User avatar URL', required: false })
  @Column({ nullable: true })
  avatar?: string;

  @ApiProperty({ description: 'User email address', required: false })
  @Column({ nullable: true })
  email?: string;

  @ApiProperty({ description: 'User role', type: () => Role })
  @ManyToOne(() => Role, (role) => role.users)
  role: Relation<Role>;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
