import { Injectable } from '@nestjs/common';
import { ClientsRepository } from './repositories/clients.repository';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { Client } from '../../database/entities/client.entity';

@Injectable()
export class ClientsService {
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
}
