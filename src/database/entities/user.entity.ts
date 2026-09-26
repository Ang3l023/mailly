import { BaseEntity } from './base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ERole } from '../../common/enums/users/roles.enum';
import { PasswordResetToken } from './password-reset-token.entity';

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

  @OneToMany(() => PasswordResetToken, (resetToken) => resetToken.user)
  passwordResetTokens: PasswordResetToken[];
}
