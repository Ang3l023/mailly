import { Injectable } from '@nestjs/common';
import { CreateVariableAdminDto } from './dto/create-variable.dto';
import { UpdateVariableAdminDto } from './dto/update-variable.dto';
import { VariableService } from '../../variable/variable.service';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class VariablesAdminService {
  constructor(private readonly variablesService: VariableService) {}

  async create(createVariableDto: CreateVariableAdminDto) {
    return await this.variablesService.create(createVariableDto);
  }

  async findAll(paginationDto: PaginationDto) {
    return await this.variablesService.findPaginated(paginationDto);
  }

  async findOne(id: number) {
    return await this.variablesService.findOne(id);
  }

  async update(id: number, updateVariableDto: UpdateVariableAdminDto) {
    return await this.variablesService.update(id, updateVariableDto);
  }

  async remove(id: number) {
    return await this.variablesService.delete(id);
  }
}
