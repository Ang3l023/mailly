import { Injectable, Logger } from '@nestjs/common';
import { ClientsRepository } from './repositories/clients.repository';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { Client } from '../../database/entities/client.entity';
import { CreateClientDto } from './dto/create-client.dto';
import { ValidationException } from '../../exceptions/validation.exception';
import { UpdateClientDto } from './dto/update-client.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { InternalException } from '../../exceptions/internal.exception';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(private readonly clientsRepository: ClientsRepository) {}

  async findByApiKey(apiKey: string) {
    const client = await this.clientsRepository.findByApiKey(apiKey);

    if (!client) {
      throw new NotFoundException(`Client with API key ${apiKey} not found`);
    }

    return client;
  }

  async findById(id: number): Promise<Client> {
    const client = await this.clientsRepository.findById(id);

    if (!client) {
      throw new NotFoundException(`Not found Client registered`);
    }

    return client;
  }

  async findPaginated(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Client>> {
    try {
      return await this.clientsRepository.findPaginated({
        pagination: paginationDto,
        searchFields: ['name'],
      });
    } catch (error) {
      this.logger.error(`Error Pagination`, error);
      throw new InternalException();
    }
  }

  async create(dto: CreateClientDto): Promise<Client> {
    const exist = await this.clientsRepository.findByApiKey(dto.apiKey);

    if (exist) {
      throw new ValidationException(
        `The API key is already registered; please enter a different value.`,
        'ERROR_VALIDATION_API_KEY',
      );
    }

    const client = await this.clientsRepository.create(dto);

    return client;
  }

  async updateOne(id: number, dto: UpdateClientDto): Promise<Client> {
    await this.findById(id);

    const updated = await this.clientsRepository.update(id, dto);

    return updated!;
  }

  async deleteOne(id: number): Promise<Client> {
    const client = await this.findById(id);

    await this.clientsRepository.delete(id);

    return client;
  }
}
