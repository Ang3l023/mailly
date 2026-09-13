import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Configuration } from '../../../database/entities/configuration.entity';

@Injectable()
export class ConfigurationRepository extends BaseRepository<Configuration> {
  constructor(
    @InjectRepository(Configuration) repository: Repository<Configuration>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async findOneByKey(key: string): Promise<Configuration | null> {
    return this.repository.findOneBy({ key });
  }

  async getOrigins(): Promise<Configuration | null> {
    return await this.findOneByKey('cors_origins');
  }

  async getMethods(): Promise<Configuration | null> {
    return await this.findOneByKey('cors_methods');
  }

  async getHeaders(): Promise<Configuration | null> {
    return await this.findOneByKey('cors_headers');
  }
}
