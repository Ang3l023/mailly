import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Variable } from '../../../database/entities/variable.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class VariableRepository extends BaseRepository<Variable> {
  constructor(
    @InjectRepository(Variable) repository: Repository<Variable>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }
}
