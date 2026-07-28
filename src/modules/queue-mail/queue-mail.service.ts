import { Injectable } from '@nestjs/common';
import { MailQueueRepository } from './repositories/mail-queue.repository';
import { CreateQueueMailDto } from './dto/create-queue-mail.dto';
import {
  MailQueue,
  MailStatus,
} from '../../database/entities/mail-queue.entity';
import { getRequestContext } from '../../common/context/request-context';
import { DeepPartial, FindManyOptions } from 'typeorm';
import { NotFoundException } from '../../exceptions/not-found.exception';

@Injectable()
export class QueueMailService {
  constructor(private readonly mailQueueRepository: MailQueueRepository) {}

  async create(dto: CreateQueueMailDto): Promise<MailQueue> {
    const { clientId } = getRequestContext();

    const queue = await this.mailQueueRepository.create({
      to: dto.to,
      cc: Array.isArray(dto.cc) ? dto.cc.join(',') : dto.cc || null,
      bcc: Array.isArray(dto.bcc) ? dto.bcc.join(',') : dto.bcc || null,
      subject: dto.subject,
      html: dto.html,
      template: {
        id: dto.template,
      },
      status: MailStatus.PENDING,
      errorMessage: dto.errorMessage,
      attempts: 0,
      metadata: JSON.stringify(dto.metadata),
      client: clientId ? { id: clientId } : undefined,
    });

    return queue;
  }

  async findAll(opts?: FindManyOptions<MailQueue>): Promise<MailQueue[]> {
    return await this.mailQueueRepository.findAll(opts);
  }

  async findOne(id: number): Promise<MailQueue> {
    const queue = await this.mailQueueRepository.findById(id, {
      client: true,
      template: true,
    });

    if (!queue) {
      throw new NotFoundException(`Not found a queue mail with ID: ${id}`);
    }

    return queue;
  }

  async updateOne(
    id: number,
    data: DeepPartial<MailQueue>,
  ): Promise<MailQueue> {
    const queue = await this.mailQueueRepository.update(id, data);

    if (!queue) {
      throw new NotFoundException(`Not found queue Mail with ID: ${id}`);
    }

    return queue;
  }
}
