import { Module } from '@nestjs/common';
import { SentMailsService } from './sent-mails.service';
import { SentMailsController } from './sent-mails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentMailsRepository } from './repositories/sent-mails.repository';
import { SentMail } from '../database/entities/sent-mail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SentMail])],
  controllers: [SentMailsController],
  providers: [SentMailsService, SentMailsRepository],
  exports: [SentMailsService, SentMailsRepository],
})
export class SentMailsModule {}
