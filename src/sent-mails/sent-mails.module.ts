import { Module } from '@nestjs/common';
import { SentMailsService } from './sent-mails.service';
import { SentMailsController } from './sent-mails.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentMailsRepository } from './repositories/sent-mails.repository';
import { SentMail } from '../database/entities/sent-mail.entity';
import { ClientMaillyGuard } from '../common/guards/client-mailly.guard';
import { MailsModule } from '../mails/mails.module';
import { TemplatesModule } from '../templates/templates.module';

@Module({
  imports: [TypeOrmModule.forFeature([SentMail]), MailsModule, TemplatesModule],
  controllers: [SentMailsController],
  providers: [SentMailsService, SentMailsRepository, ClientMaillyGuard],
  exports: [SentMailsService, SentMailsRepository],
})
export class SentMailsModule {}
