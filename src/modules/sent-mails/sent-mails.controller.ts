import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { SentMailsService } from './sent-mails.service';
import { CreateSentMailDto } from './dto/create-sent-mail.dto';
import { ClientMaillyGuard } from '../../common/guards/client-mailly.guard';
import { CurrentClient } from '../../common/decorators/current-client.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('sent-mails')
@UseGuards(ClientMaillyGuard)
export class SentMailsController {
  constructor(private readonly sentMailsService: SentMailsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('attachedFiles'))
  create(
    @Body() createSentMailDto: CreateSentMailDto,
    @CurrentClient('id') clientId: number,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          // Tamaño máximo por archivo (ejemplo: 5 MB)
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),

          // Formatos permitidos (ajusta según necesites)
          new FileTypeValidator({
            fileType: /(pdf|jpe?g|png|docx?|xlsx?|txt)$/i,
          }),
        ],
        fileIsRequired: false,
      }),
    )
    attachedFiles: Express.Multer.File[],
  ) {
    if (attachedFiles && attachedFiles.length > 0) {
      createSentMailDto.attachedFiles = attachedFiles.map((file) => ({
        fileName: file.originalname,
        content: file.buffer,
        contentType: file.mimetype,
      }));
    }

    return this.sentMailsService.sendMail(createSentMailDto, clientId);
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
