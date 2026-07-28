import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Client } from './client.entity';
import { BaseEntity } from './base.entity';
import { Variable } from './variable.entity';
import { MailQueue } from './mail-queue.entity';
import { SentMail } from './sent-mail.entity';
import { Exclude } from 'class-transformer';

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
  @Exclude()
  filename!: string;

  @Column({ nullable: true, default: null, type: 'varchar' })
  @Exclude()
  html?: string;

  @Column({ nullable: true, default: null })
  @Exclude()
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

  @OneToMany(() => SentMail, (queue) => queue.template)
  sentMails?: SentMail[];

  @OneToMany(() => MailQueue, (queue) => queue.template)
  queueMails?: MailQueue[];
}
