import { Module } from '@nestjs/common';
import { SentMailsService } from './sent-mails.service';
import { SentMailsController } from './sent-mails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentMailsRepository } from './repositories/sent-mails.repository';
import { TemplatesModule } from '../templates/templates.module';
import { SentMail } from '../../database/entities/sent-mail.entity';
import { ClientMaillyGuard } from '../../common/guards/client-mailly.guard';

@Module({
  imports: [TypeOrmModule.forFeature([SentMail]), TemplatesModule],
  controllers: [SentMailsController],
  providers: [SentMailsService, SentMailsRepository, ClientMaillyGuard],
  exports: [SentMailsService],
})
export class SentMailsModule {}
