import {
  DataSource,
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsRelations,
  FindOptionsWhere,
  QueryRunner,
  Repository,
} from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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

  async findById(
    id: number,
    relations?: FindOptionsRelations<T>,
  ): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as FindOptionsWhere<T>,
      relations,
    });
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T | null> {
    // 1. Limpiamos las relaciones en el DTO/Payload
    const cleanData = this.sanitizeRelations(data);

    // 2. Ejecutamos el update con los datos desinfectados
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updateResult = await this.repository.update(id, cleanData as any);

    if (updateResult.affected === 0) {
      return null;
    }

    // 3. Opcional: Retornar el registro actualizado
    return await this.findById(id);
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
      // 1. SIEMPRE haz el rollback primero
      await queryRunner.rollbackTransaction();

      // 2. Si el callback lanzó una excepción nativa de NestJS (ej. NotFoundException),
      // re-lánzala directamente para mantener su status HTTP y mensaje original.
      if (error instanceof HttpException) {
        throw error;
      }

      // 3. Manejar errores específicos del motor de Base de Datos (ej. MySQL Error Codes)
      this.handleDatabaseErrors(error);

      // 4. Fallback para errores no identificados
      throw new InternalServerErrorException(
        'Ocurrió un error inesperado al procesar la transacción',
      );
    } finally {
      // Garatiza que SIEMPRE se libere la conexión
      await queryRunner.release();
    }
  }

  private handleDatabaseErrors(error: any): void {
    // Código 1062 en MySQL = Duplicate entry (violación de índice UNIQUE)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.code === 'ER_DUP_ENTRY' || error?.number === 1062) {
      throw new ConflictException('El registro ya existe en la base de datos.');
    }

    // Código 1452 en MySQL = Cannot add or update a child row (Error de Foreign Key)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error?.code === 'ER_NO_REFERENCED_ROW_2' || error?.number === 1452) {
      throw new BadRequestException(
        'La entidad relacionada especificada no existe.',
      );
    }
  }

  /**
   * Helper privado para limpiar objetos de relación en payloads de actualización.
   * Transforma relaciones tipo `{ client: { id: 1, deletedAt: null, name: 'X' } }`
   * en objetos limpios tipo `{ client: { id: 1 } }`.
   */
  private sanitizeRelations(data: Record<string, any>): Record<string, any> {
    const sanitized = { ...data };

    for (const key of Object.keys(sanitized)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = sanitized[key];

      // Si el valor es un objeto (relación) pero no es una Fecha ni un Array
      if (
        value !== null &&
        typeof value === 'object' &&
        !(value instanceof Date) &&
        !Array.isArray(value)
      ) {
        // Si el objeto de la relación contiene una clave primaria (id)
        if ('id' in value) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          sanitized[key] = { id: value.id };
        }
      }
    }

    return sanitized;
  }
}
