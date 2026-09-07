import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Prompt } from './prompt.entity';

export enum PromptMessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

@Entity('prompt_messages')
export class PromptMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  role: PromptMessageRole;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Prompt, (prompt) => prompt.messages, { onDelete: 'CASCADE' })
  prompt: Relation<Prompt>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
