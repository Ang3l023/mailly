import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'configurations' })
export class Configuration extends BaseEntity {
  @Index()
  @Column()
  key: string;

  @Column()
  value: string;

  @Column()
  description: string;
}
