import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Client } from './client.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Template extends BaseEntity {
  @ManyToOne(() => Client, (client) => client.templates)
  @JoinColumn({ name: 'client_id' })
  client!: Client;

  @Column({ nullable: false })
  code!: number;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  filename!: string;

  @Column({ nullable: true, default: null, type: 'varchar' })
  html?: string;

  @Column({ nullable: true, default: null })
  file?: string;
}
