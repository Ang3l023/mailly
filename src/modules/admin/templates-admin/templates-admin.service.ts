import { Injectable } from '@nestjs/common';
import { CreateTemplatesAdminDto } from './dto/create-templates-admin.dto';
import { UpdateTemplatesAdminDto } from './dto/update-templates-admin.dto';
import { TemplatesService } from '../../templates/templates.service';

@Injectable()
export class TemplatesAdminService {
  constructor(private readonly templatesService: TemplatesService) {}

  async create(
    createTemplatesAdminDto: CreateTemplatesAdminDto,
    file?: Express.Multer.File,
  ) {
    return await this.templatesService.create(createTemplatesAdminDto, file);
  }

  findAll() {
    return `This action returns all templatesAdmin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} templatesAdmin`;
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
    return `This action removes a #${id} templatesAdmin`;
  }
}
