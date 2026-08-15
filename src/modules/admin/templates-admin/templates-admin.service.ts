import { Injectable } from '@nestjs/common';
import { CreateTemplatesAdminDto } from './dto/create-templates-admin.dto';
import { UpdateTemplatesAdminDto } from './dto/update-templates-admin.dto';
import { TemplatesService } from '../../templates/templates.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class TemplatesAdminService {
  constructor(private readonly templatesService: TemplatesService) {}

  async create(
    createTemplatesAdminDto: CreateTemplatesAdminDto,
    file?: Express.Multer.File,
  ) {
    return await this.templatesService.create(createTemplatesAdminDto, file);
  }

  findAll(paginationDto: PaginationDto) {
    return this.templatesService.findPaginated(paginationDto);
  }

  findOne(id: number) {
    return this.templatesService.findById(id);
  }

  async update(
    id: number,
    updateTemplatesAdminDto: UpdateTemplatesAdminDto,
    file?: Express.Multer.File,
  ) {
    return await this.templatesService.update(
      updateTemplatesAdminDto,
      id,
      file,
    );
  }

  remove(id: number) {
    return this.templatesService.delete(id);
  }
}
