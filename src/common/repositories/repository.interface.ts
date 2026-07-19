import { DeepPartial, FindManyOptions, FindOneOptions } from 'typeorm';

export interface IRepository<T> {
  create(data: DeepPartial<T>): Promise<T>;

  findAll(options?: FindManyOptions<T>): Promise<T[]>;

  findById(id: number): Promise<T | null>;

  findOne(options: FindOneOptions<T>): Promise<T | null>;

  update(id: number, data: DeepPartial<T>): Promise<T>;

  delete(id: number): Promise<void>;

  exists(id: number): Promise<boolean>;
}
