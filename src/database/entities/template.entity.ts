import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Client } from './client.entity';
import { BaseEntity } from './base.entity';
import { Variable } from './variable.entity';

@Entity()
export class Template extends BaseEntity {
  @ManyToOne(() => Client, (client) => client.templates)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ nullable: false })
  code!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: String, default: null, nullable: true })
  subject?: string | null;

  @Column({ type: String, nullable: true, default: null })
  description?: string | null;

  @Column({ nullable: false })
  filename!: string;

  @Column({ nullable: true, default: null, type: 'varchar' })
  html?: string;

  @Column({ nullable: true, default: null })
  file?: string;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToMany(() => Variable, (variable) => variable.templates, {
    cascade: true,
  })
  @JoinTable({
    name: 'templates_variables',
    joinColumn: { name: 'template_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'variable_id', referencedColumnName: 'id' },
  })
  variables!: Variable[];
}
