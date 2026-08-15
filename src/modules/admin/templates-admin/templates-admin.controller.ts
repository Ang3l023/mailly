import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplatesAdminService } from './templates-admin.service';
import { CreateTemplatesAdminDto } from './dto/create-templates-admin.dto';
import { UpdateTemplatesAdminDto } from './dto/update-templates-admin.dto';

@Controller('admin/templates')
export class TemplatesAdminController {
  constructor(private readonly templatesAdminService: TemplatesAdminService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createTemplatesAdminDto: CreateTemplatesAdminDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.templatesAdminService.create(createTemplatesAdminDto, file);
  }

  @Get()
  findAll() {
    return this.templatesAdminService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templatesAdminService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: number,
    @Body() updateTemplatesAdminDto: UpdateTemplatesAdminDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.templatesAdminService.update(id, updateTemplatesAdminDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.templatesAdminService.remove(+id);
  }
}
