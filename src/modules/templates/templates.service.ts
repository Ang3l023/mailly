import { Injectable } from '@nestjs/common';
import { TemplatesRepository } from './repositories/templates.repository';
import { ClientsService } from '../clients/clients.service';
import { Template } from '../../database/entities/template.entity';
import { NotFoundException } from '../../exceptions/not-found.exception';

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
      {
        variables: {
          options: true,
          rules: true,
        },
      },
    );

    if (!template) {
      throw new NotFoundException(`Not found template with ID:${code}`);
    }

    return template;
  }

  async findByFileNameAndClient(
    filename: string,
    clientId: number,
  ): Promise<Template> {
    await this.clientService.findById(clientId);

    const template = await this.templateRepository.findOne({
      where: { filename, client: { id: clientId } },
    });

    if (!template) {
      throw new NotFoundException(`Not found template with Name:${filename}`);
    }

    return template;
  }
}
