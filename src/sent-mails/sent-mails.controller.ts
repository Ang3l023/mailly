import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SentMailsService } from './sent-mails.service';
import { CreateSentMailDto } from './dto/create-sent-mail.dto';
import { UpdateSentMailDto } from './dto/update-sent-mail.dto';

@Controller('sent-mails')
export class SentMailsController {
  constructor(private readonly sentMailsService: SentMailsService) {}

  @Post()
  create(@Body() createSentMailDto: CreateSentMailDto) {
    return this.sentMailsService.create(createSentMailDto);
  }

  @Get()
  findAll() {
    return this.sentMailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sentMailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSentMailDto: UpdateSentMailDto) {
    return this.sentMailsService.update(+id, updateSentMailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sentMailsService.remove(+id);
  }
}
