import { Injectable } from '@nestjs/common';
import { CreateSentMailDto } from './dto/create-sent-mail.dto';
import { UpdateSentMailDto } from './dto/update-sent-mail.dto';

@Injectable()
export class SentMailsService {
  create(createSentMailDto: CreateSentMailDto) {
    return 'This action adds a new sentMail';
  }

  findAll() {
    return `This action returns all sentMails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sentMail`;
  }

  update(id: number, updateSentMailDto: UpdateSentMailDto) {
    return `This action updates a #${id} sentMail`;
  }

  remove(id: number) {
    return `This action removes a #${id} sentMail`;
  }
}
