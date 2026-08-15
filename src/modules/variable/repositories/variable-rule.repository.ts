import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { VariableRules } from '../../../database/entities/variable-rules';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class VariableRuleRepository extends BaseRepository<VariableRules> {
  constructor(
    @InjectRepository(VariableRules) repository: Repository<VariableRules>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
