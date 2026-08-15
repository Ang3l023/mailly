import { Injectable, Logger } from '@nestjs/common';
import { TemplatesRepository } from './repositories/templates.repository';
import { ClientsService } from '../clients/clients.service';
import { Template } from '../../database/entities/template.entity';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { VariableService } from '../variable/variable.service';
import { UpdateTemplatesDto } from './dto/update-templates.dto';
import { S3_PATH } from '../../common/constants/s3-path.constant';
import { extname } from 'path';
import { FileStorageService } from '../file-storage/file-storage.service';
import { FileStorageError } from '../file-storage/errors/file-storage.errors';
import { ValidationException } from '../../exceptions/validation.exception';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    private readonly templateRepository: TemplatesRepository,
    private readonly clientService: ClientsService,
    private readonly fileStorageService: FileStorageService,
    private readonly variableService: VariableService,
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

  async create(
    createTemplatesDto: CreateTemplatesDto,
    file?: Express.Multer.File,
  ): Promise<Template> {
    const client = await this.clientService.findById(
      createTemplatesDto.clientId,
    );

    if (!createTemplatesDto.code) {
      createTemplatesDto.code =
        await this.templateRepository.getNextCodeForClient(client.id);
    } else {
      const exists = await this.findByCodeAndClient(
        createTemplatesDto.code,
        client.id,
      );

      if (exists) {
        throw new NotFoundException(
          `Template with code ${createTemplatesDto.code} already exists for client ${client.name}`,
        );
      }
    }

    this.logger.log(
      `Creating template for client: ${client.name}: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}`,
    );

    const variables = await this.variableService.findByIds(
      createTemplatesDto.variablesIds,
    );

    if (variables.length !== createTemplatesDto.variablesIds.length) {
      const notFoundIds = createTemplatesDto.variablesIds.filter(
        (id) => !variables.some((variable) => variable.id === id),
      );

      throw new NotFoundException(
        `Some variables not found for the provided IDs: ${notFoundIds.join(', ')}`,
      );
    }

    this.logger.log(
      `Found ${variables.length} variables for template: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}`,
    );

    const templateData: Partial<Template> = {
      code: createTemplatesDto.code,
      name: createTemplatesDto.name,
      subject: createTemplatesDto.subject,
      description: createTemplatesDto.description,
      filename: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${createTemplatesDto.code}-${createTemplatesDto.name.replaceAll(' ', '_').toLowerCase()}`,
      variables,
      client,
    };

    if (file) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${createTemplatesDto.code}-${createTemplatesDto.name.replaceAll(' ', '_').toLowerCase()}${extname(file.originalname)}`;
      const pathTemplate = S3_PATH.TEMPLATES(client.id, fileName);

      this.logger.log(
        `Uploading file for template: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}, Path: ${pathTemplate}`,
      );

      try {
        await this.fileStorageService.upload({
          key: pathTemplate,
          body: file.buffer,
          contentType: file.mimetype,
        });

        this.logger.log(
          `File uploaded for template: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}, Path: ${pathTemplate}`,
        );
      } catch (error: any) {
        if (error instanceof FileStorageError) {
          this.logger.error(
            `Error uploading file for template: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}, Error: ${error.message}`,
          );
          throw new ValidationException(
            `Error uploading file for template: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}, Error: ${error.message}`,
          );
        }

        this.logger.error(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          `Error uploading file for template: ${createTemplatesDto.code}, Name: ${createTemplatesDto.name}, Error: ${error.message}`,
        );
        throw error;
      }

      templateData.filename = fileName;
      templateData.file = pathTemplate;
    } else {
      templateData.html = createTemplatesDto.html ?? undefined;
    }

    return await this.templateRepository.create(templateData);
  }

  async update(
    updateTemplatesDto: UpdateTemplatesDto,
    templateId: number,
    file?: Express.Multer.File,
  ): Promise<Template> {
    const template = await this.templateRepository.findById(templateId, {
      variables: true,
      client: true,
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    const keysToUpdate: (keyof UpdateTemplatesDto)[] = [
      'name',
      'subject',
      'description',
      'isActive',
    ];

    for (const key of Object.keys(updateTemplatesDto).filter((key) =>
      keysToUpdate.includes(key as keyof UpdateTemplatesDto),
    ) as (keyof UpdateTemplatesDto)[]) {
      if (updateTemplatesDto[key] !== undefined) {
        template[key] = updateTemplatesDto[key];
      }
    }

    if (updateTemplatesDto.variablesIds) {
      const variables = await this.variableService.findByIds(
        updateTemplatesDto.variablesIds,
      );

      if (variables.length !== updateTemplatesDto.variablesIds.length) {
        const notFoundIds = updateTemplatesDto.variablesIds.filter(
          (id) => !variables.some((variable) => variable.id === id),
        );

        throw new NotFoundException(
          `Some variables not found for the provided IDs: ${notFoundIds.join(', ')}`,
        );
      }

      template.variables = variables;
    }

    if ((file || updateTemplatesDto.html) && template.file) {
      const exist = await this.fileStorageService.exists(template.file);

      if (exist) {
        await this.fileStorageService.delete(template.file);
      }
    }

    if (file) {
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${template.code}-${(updateTemplatesDto.name ?? template.name).replaceAll(' ', '_').toLowerCase()}${extname(file.originalname)}`;
      const pathTemplate = S3_PATH.TEMPLATES(template.client.id, fileName);
      await this.fileStorageService.upload({
        key: pathTemplate,
        body: file.buffer,
        contentType: file.mimetype,
      });
      template.filename = fileName;
      template.file = pathTemplate;
    }

    if (updateTemplatesDto.html) {
      template.html = updateTemplatesDto.html;
      template.file = undefined;
    }

    return (await this.templateRepository.update(templateId, template))!;
  }
}
