import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { User } from '@usr/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @Column({ unique: true })
  token: string;

  @Column()
  exp: Date;

  @Column({ default: false })
  isRevoked: boolean;

  @Column()
  agentInfo: string;

  @CreateDateColumn()
  createdAt: Date;
}
