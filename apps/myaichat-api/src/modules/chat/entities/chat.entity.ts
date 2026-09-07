import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@usr/entities/user.entity';
import { Message } from './message.entity';
import { Prompt } from '@prompts/entities/prompt.entity';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: Relation<User>;

  @ManyToOne(() => Prompt, (prompt) => prompt.chats, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  prompt?: Relation<Prompt>;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Relation<Message[]>;

  @Column({ type: 'int', default: 4096 })
  maxTokens: number;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 1.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value),
    },
  })
  temperature: number;

  @Column({ type: 'varchar' })
  model: string;

  @Column({ type: 'boolean', default: false })
  isImageGeneration: boolean;

  @Column({ type: 'boolean', default: false })
  isWebSearch: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
