import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Exclude } from 'class-transformer';

@Entity('password_reset_tokens')
export class PasswordResetToken extends BaseEntity {
  @Exclude()
  @ManyToOne(() => User, (user) => user.passwordResetTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Exclude()
  @Column()
  codeHash: string;

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  verified: boolean;

  @Column({ default: 0 })
  attempts: number;

  @Column({ nullable: true, type: 'datetime' })
  usedAt: Date | null;
}
