import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  QueryRunner,
  Repository,
} from 'typeorm';

import { NotFoundException } from '@nestjs/common';

import { IRepository } from './repository.interface';
import { BaseEntity } from 'src/database/entities/base.entity';

export abstract class BaseRepository<
  T extends BaseEntity,
> implements IRepository<T> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource: DataSource,
  ) {}

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findById(id: number): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findById(id);

    if (!entity) {
      throw new NotFoundException(`Registro ${id} no encontrado`);
    }

    Object.assign(entity, data);

    return this.repository.save(entity);
  }

  async delete(id: number): Promise<void> {
    const result = await this.repository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Registro ${id} no encontrado`);
    }
  }

  async exists(id: number): Promise<boolean> {
    return this.repository.exists({
      where: { id } as FindOptionsWhere<T>,
    });
  }

  async runInTransaction<I>(
    work: (queryRunner: QueryRunner) => Promise<I>,
  ): Promise<I> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      // Ejecuta la lógica del negocio que pasaste como callback
      const result = await work(queryRunner);

      // Si todo fue bien, hace el commit
      await queryRunner.commitTransaction();
      return result;
    } catch (error: any) {
      // Si ocurrió un error, revierte los cambios
      await queryRunner.rollbackTransaction();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Error en la transacción: ${error.message}`);
    } finally {
      // Garatiza que SIEMPRE se libere la conexión
      await queryRunner.release();
    }
  }
}
