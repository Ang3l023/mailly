import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { MailQueue } from '../../../database/entities/mail-queue.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MailQueueRepository extends BaseRepository<MailQueue> {
  constructor(
    @InjectRepository(MailQueue) repository: Repository<MailQueue>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
