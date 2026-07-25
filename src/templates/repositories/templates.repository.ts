import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { Template } from '../../database/entities/template.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../database/entities/client.entity';

@Injectable()
export class TemplatesRepository extends BaseRepository<Template> {
  constructor(@InjectRepository(Template) repository: Repository<Template>) {
    super(repository);
  }

  async findByCodeAndClient(
    code: number,
    client: Client,
  ): Promise<Template | null> {
    return await this.repository.findOne({
      where: { code, client: { id: client.id } },
    });
  }
}
