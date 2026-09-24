import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Model } from './model.entity';

@Entity('model_developers')
export class ModelDeveloper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  link: string;

  @Column()
  imageUrl: string;

  @OneToMany(() => Model, (model) => model.developer)
  models: Relation<Model[]>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
