import { BaseEntity } from './base.entity';
import { Column, Entity } from 'typeorm';
import { ERole } from '../../common/enums/users/roles.enum';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: ERole, default: ERole.USER })
  role: ERole;

  @Column({ default: true })
  enabled: boolean;
}
