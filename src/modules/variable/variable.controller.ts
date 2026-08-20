import { Controller, Get, Param, Query } from '@nestjs/common';
import { VariableService } from './variable.service';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('variable')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}

  @Get()
  async findAll(@Query() paginatedDto: PaginationDto) {
    return await this.variableService.findPaginated(paginatedDto, {
      visible: true,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.variableService.findOne(id);
  }
}
