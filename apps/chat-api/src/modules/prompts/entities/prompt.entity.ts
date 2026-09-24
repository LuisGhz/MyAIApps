import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '@usr/entities/user.entity';
import { Chat } from '@chat/entities/chat.entity';
import { PromptMessage } from './prompt-message.entity';

@Entity('prompts')
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @OneToMany(() => Chat, (chat) => chat.prompt)
  chats: Relation<Chat[]>;

  @OneToMany(() => PromptMessage, (message) => message.prompt, {
    cascade: true,
  })
  messages: Relation<PromptMessage[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
