import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { VariableOptions } from '../../../database/entities/variable-options';

@Injectable()
export class VariableOptionRepository extends BaseRepository<VariableOptions> {
  constructor(
    @InjectRepository(VariableOptions) repository: Repository<VariableOptions>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
