import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueMailService } from './queue-mail.service';
import { MailQueue } from '../../database/entities/mail-queue.entity';
import { MailQueueRepository } from './repositories/mail-queue.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MailQueue])],
  providers: [QueueMailService, MailQueueRepository],
  exports: [QueueMailService],
})
export class QueueMailModule {}
