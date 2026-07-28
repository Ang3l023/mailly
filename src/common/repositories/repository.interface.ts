import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  QueryRunner,
} from 'typeorm';
import { PaginateOptions } from '../interfaces/paginate.interface';
import { PaginatedResult } from '../interfaces/paginated-result.interface';
import { BaseEntity } from '../../database/entities/base.entity';

export interface IRepository<T extends BaseEntity> {
  create(data: DeepPartial<T>): Promise<T>;

  findAll(options?: FindManyOptions<T>): Promise<T[]>;

  findById(id: number): Promise<T | null>;

  findOne(options: FindOneOptions<T>): Promise<T | null>;

  update(id: number, data: DeepPartial<T>): Promise<T | null>;

  delete(id: number): Promise<void>;

  exists(id: number): Promise<boolean>;

  findPaginated(options: PaginateOptions<T>): Promise<PaginatedResult<T>>;

  runInTransaction<I>(
    work: (queryRunner: QueryRunner) => Promise<I>,
  ): Promise<I>;
}
