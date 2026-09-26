import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { PasswordResetToken } from '../../../database/entities/password-reset-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PasswordResetTokenRepository extends BaseRepository<PasswordResetToken> {
  constructor(
    @InjectRepository(PasswordResetToken)
    repository: Repository<PasswordResetToken>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
