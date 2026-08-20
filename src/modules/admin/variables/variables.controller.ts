import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { VariablesAdminService } from './variables.service';
import { CreateVariableAdminDto } from './dto/create-variable.dto';
import { UpdateVariableAdminDto } from './dto/update-variable.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller('admin/variables')
export class VariablesAdminController {
  constructor(private readonly variablesAdminService: VariablesAdminService) {}

  @Post()
  create(@Body() createVariableDto: CreateVariableAdminDto) {
    return this.variablesAdminService.create(createVariableDto);
  }

  @Get()
  findAll(@Query() queryDto: PaginationDto) {
    return this.variablesAdminService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.variablesAdminService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateVariableDto: UpdateVariableAdminDto,
  ) {
    return this.variablesAdminService.update(id, updateVariableDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.variablesAdminService.remove(id);
  }
}
