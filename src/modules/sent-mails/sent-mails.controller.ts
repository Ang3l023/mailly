import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { SentMailsService } from './sent-mails.service';
import { CreateSentMailDto } from './dto/create-sent-mail.dto';
import { ClientMaillyGuard } from '../../common/guards/client-mailly.guard';
import { CurrentClient } from '../../common/decorators/current-client.decorator';

@Controller('sent-mails')
@UseGuards(ClientMaillyGuard)
export class SentMailsController {
  constructor(private readonly sentMailsService: SentMailsService) {}

  @Post()
  create(
    @Body() createSentMailDto: CreateSentMailDto,
    @CurrentClient('id') clientId: number,
  ) {
    return this.sentMailsService.create(createSentMailDto, clientId);
  }

  @Get()
  findAll(@CurrentClient('id') clientId: number) {
    return this.sentMailsService.findAll(clientId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentClient('id') clientId: number,
  ) {
    return this.sentMailsService.findOne(id, clientId);
  }
}
