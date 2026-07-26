import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Log } from '../../../database/entities/log.entity';

@Injectable()
export class LogsRepository extends BaseRepository<Log> {
  constructor(
    @InjectRepository(Log) repository: Repository<Log>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
