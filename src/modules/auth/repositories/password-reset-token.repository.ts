import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { PasswordResetToken } from '../../../database/entities/password-reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';

@Injectable()
export class PasswordResetTokenRepository extends BaseRepository<PasswordResetToken> {
  constructor(
    @InjectRepository(PasswordResetToken)
    repository: Repository<PasswordResetToken>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async invalidateTokensBefore(userId: number): Promise<void> {
    await this.repository
      .createQueryBuilder()
      .update(PasswordResetToken)
      .set({ usedAt: () => 'NOW()' })
      .where('user_id = :userId', { userId })
      .andWhere('usedAt IS NULL')
      .execute();
  }

  async findLastToken(userId: number): Promise<PasswordResetToken | null> {
    return await this.repository.findOne({
      where: {
        user: {
          id: userId,
        },
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
