import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplatesRepository } from './repositories/templates.repository';
import { ClientsService } from '../clients/clients.service';
import { Template } from '../database/entities/template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    private readonly templateRepository: TemplatesRepository,
    private readonly clientService: ClientsService,
  ) {}

  async findByCodeAndClient(code: number, clientId: number): Promise<Template> {
    const client = await this.clientService.findById(clientId);

    const template = await this.templateRepository.findByCodeAndClient(
      code,
      client,
    );

    if (!template) {
      throw new NotFoundException(`Not found template with ID:${code}`);
    }

    return template;
  }
}
