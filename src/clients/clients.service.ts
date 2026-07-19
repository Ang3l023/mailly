import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientsRepository } from './repositories/clients.repository';

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
}
