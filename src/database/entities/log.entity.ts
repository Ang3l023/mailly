import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from './client.entity';
import { SentMail } from './sent-mail.entity';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Client, (client) => client.logs, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @ManyToOne(() => SentMail, (sentMail) => sentMail.logs, { nullable: false })
  @JoinColumn({ name: 'sent_mail_id' })
  sentMail!: SentMail;

  @Column({ nullable: false })
  event!: string;

  @Column({ nullable: true, default: null })
  body!: string;

  @Column({ nullable: true, default: null, name: 'attached_file' })
  attachedFile?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
