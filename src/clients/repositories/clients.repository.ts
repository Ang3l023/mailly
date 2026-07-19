import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../../database/entities/client.entity';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Repository } from 'typeorm';

@Injectable()
export class ClientsRepository extends BaseRepository<Client> {
  constructor(
    @InjectRepository(Client)
    repository: Repository<Client>,
  ) {
    super(repository);
  }

  async findByApiKey(apiKey: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { apiKey },
    });
  }
}
