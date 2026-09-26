import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
  @ManyToOne(() => User, (user) => user.passwordResetTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  codeHash: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true })
  usedAt: Date | null;
}
