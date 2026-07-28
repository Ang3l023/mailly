import { Injectable } from '@nestjs/common';
import { ClientsService } from '../../clients/clients.service';
import { CreateClientDto } from '../../clients/dto/create-client.dto';
import { UpdateClientDto } from '../../clients/dto/update-client.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';

@Injectable()
export class ClientAdminService {
  constructor(private readonly clientService: ClientsService) {}

  async create(createClientDto: CreateClientDto) {
    return await this.clientService.create(createClientDto);
  }

  async findAll(paginateDto: PaginationDto) {
    return await this.clientService.findPaginated(paginateDto);
  }

  async findOne(id: number) {
    return await this.clientService.findById(id);
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    return await this.clientService.updateOne(id, updateClientDto);
  }

  remove(id: number) {
    return this.clientService.deleteOne(id);
  }
}
