import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SentMail } from '../../database/entities/sent-mail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Client } from '../../database/entities/client.entity';

@Injectable()
export class SentMailsRepository extends BaseRepository<SentMail> {
  constructor(
    @InjectRepository(SentMail) repository: Repository<SentMail>,
    dataSource: DataSource,
  ) {
    super(repository, dataSource);
  }

  async findByClient(client: Client): Promise<SentMail[]> {
    return await this.repository.find({ where: { client } });
  }

  async findOneByIdAndClient(
    id: number,
    clientId: number,
  ): Promise<SentMail | null> {
    return await this.repository.findOne({
      where: { client: { id: clientId }, id },
    });
  }
}
