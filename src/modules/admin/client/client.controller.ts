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
import { ClientAdminService } from './client.service';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { UpdateClientDto } from '../../clients/dto/update-client.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Controller('admin/client')
export class ClientAdminController {
  constructor(private readonly clientService: ClientAdminService) {}

  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientService.create(createClientDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.clientService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientService.update(+id, updateClientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(+id);
  }
}
