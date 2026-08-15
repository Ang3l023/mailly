import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsRelations, Repository } from 'typeorm';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Template } from '../../../database/entities/template.entity';
import { Client } from '../../../database/entities/client.entity';

@Injectable()
export class TemplatesRepository extends BaseRepository<Template> {
  constructor(
    @InjectRepository(Template) repository: Repository<Template>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async findByCodeAndClient(
    code: number,
    client: Client,
    relations?: FindOptionsRelations<Template>,
  ): Promise<Template | null> {
    return await this.repository.findOne({
      where: { code, client: { id: client.id } },
      relations,
    });
  }

  async getNextCodeForClient(clientId: number): Promise<number> {
    const lastTemplate = await this.repository.findOne({
      where: { client: { id: clientId } },
      order: { code: 'DESC' },
    });

    return lastTemplate ? lastTemplate.code + 1 : 1;
  }
}
