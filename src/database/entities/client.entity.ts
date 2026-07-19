import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Log } from './log.entity';
import { SentMail } from './sent-mail.entity';

@Entity({ name: 'clients' })
export class Client {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false, name: 'api_key' })
  apiKey!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true, default: null, name: 'sender_default' })
  senderDefault?: string;

  @Column({ nullable: false, default: true })
  enabled!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt?: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToMany(() => SentMail, (sentMail) => sentMail.client)
  sentMails!: SentMail[];

  @OneToMany(() => Log, (log) => log.client)
  logs?: Log[];
}
