import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SentMail } from '../../database/entities/sent-mail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SentMailsRepository extends BaseRepository<SentMail> {
  constructor(@InjectRepository(SentMail) repository: Repository<SentMail>) {
    super(repository);
  }
}
