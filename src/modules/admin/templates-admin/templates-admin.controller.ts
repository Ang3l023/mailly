import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplatesAdminService } from './templates-admin.service';
import { CreateTemplatesAdminDto } from './dto/create-templates-admin.dto';
import { UpdateTemplatesAdminDto } from './dto/update-templates-admin.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ERole } from '../../../common/enums/users/roles.enum';

@Roles(ERole.ADMIN)
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
  findAll(@Query() paginationDto: PaginationDto) {
    return this.templatesAdminService.findAll(paginationDto);
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
