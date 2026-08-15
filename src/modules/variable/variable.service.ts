import { Injectable } from '@nestjs/common';
import { VariableRepository } from './repositories/variable.repository';
import { Variable } from '../../database/entities/variable.entity';
import { In } from 'typeorm';

@Injectable()
export class VariableService {
  constructor(private readonly variableRepository: VariableRepository) {}

  async findByIds(ids: number[]): Promise<Variable[]> {
    return this.variableRepository.findAll({ where: { id: In(ids) } });
  }
}
