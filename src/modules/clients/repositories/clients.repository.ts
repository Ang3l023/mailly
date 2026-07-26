import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Client } from '../../../database/entities/client.entity';

@Injectable()
export class ClientsRepository extends BaseRepository<Client> {
  constructor(
    @InjectRepository(Client)
    repository: Repository<Client>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async findByApiKey(apiKey: string): Promise<Client | null> {
    return this.repository.findOne({
      where: { apiKey, enabled: true },
    });
  }
}
