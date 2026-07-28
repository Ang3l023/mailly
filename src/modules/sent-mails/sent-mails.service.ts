import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSentMailDto } from './dto/create-sent-mail.dto';
import { SentMailsRepository } from './repositories/sent-mails.repository';
import { ClientsService } from '../clients/clients.service';
import { MailsService } from '../mails/mails.service';
import { TemplatesService } from '../templates/templates.service';
import { IConfigSchema } from '../../common/interfaces/config.interface';
import { SentMail } from '../../database/entities/sent-mail.entity';
import { NotFoundException } from '../../exceptions/not-found.exception';
import { validateTemplateVariables } from '../../common/utils/validate-template-variables';
import { ValidationException } from '../../exceptions/validation.exception';
import { EStatusSentMail } from '../../common/enums/sent-mail/status.enum';
import { SendMailDto } from '../mails/dto/send-mail.dto';

@Injectable()
export class SentMailsService {
  private readonly logger = new Logger(SentMailsService.name);

  constructor(
    private readonly configService: ConfigService<IConfigSchema>,
    private readonly sentMailsRepository: SentMailsRepository,
    private readonly clientService: ClientsService,
    @Inject(forwardRef(() => MailsService))
    private readonly mailsService: MailsService,
    private readonly templateService: TemplatesService,
  ) {}

  async create(createSentMailDto: CreateSentMailDto, clientId: number) {
    const client = await this.clientService.findById(clientId);

    const template = await this.templateService.findByCodeAndClient(
      createSentMailDto.template,
      clientId,
    );

    if (!createSentMailDto.subject && !template.subject) {
      throw new ValidationException(`No valid subject has been provided.`);
    }

    const {
      from = client.senderDefault ||
        this.configService.get<string>('mail.from', { infer: true })!,
      to,
      subject,
      params,
      cc,
      bcc,
    } = createSentMailDto;

    const sent = await this.sentMailsRepository.create({
      client,
      from,
      to,
      cc: Array.isArray(cc) ? cc.join(',') : cc,
      bcc: Array.isArray(bcc) ? bcc.join(',') : bcc,
      subject,
      html: template.html,
      template: template,
      status: EStatusSentMail.SENT,
      errorMessage: null,
      metadata: params ? JSON.stringify(params) : null,
    });

    return sent;
  }

  async findAll(clientId: number): Promise<SentMail[]> {
    const client = await this.clientService.findById(clientId);

    return await this.sentMailsRepository.findByClient(client);
  }

  async findOne(id: number, clientId: number): Promise<SentMail> {
    const client = await this.clientService.findById(clientId);

    const sentMail = await this.sentMailsRepository.findOneByIdAndClient(
      id,
      client.id,
    );

    if (!sentMail) {
      throw new NotFoundException(`Not found mail with ID: ${id}`);
    }

    return sentMail;
  }

  async updateOne(
    id: number,
    clientId: number,
    dto: Partial<SentMail>,
  ): Promise<SentMail> {
    const sentMail = await this.findOne(id, clientId);

    try {
      const updated = await this.sentMailsRepository.update(sentMail.id, dto);

      return updated!;
    } catch (error) {
      this.logger.error(
        `An error has been ocurred during update with ID: ${id}`,
        error,
      );
      throw new Error(`An error has been ocurred during update with ID: ${id}`);
    }
  }

  async sendMail(dto: CreateSentMailDto, clientId: number) {
    const client = await this.clientService.findById(clientId);

    const { template: templateCode } = dto;

    const template = await this.templateService.findByCodeAndClient(
      templateCode,
      clientId,
    );

    if (!dto.subject && !template.subject) {
      throw new ValidationException(`No valid subject has been provided.`);
    }

    const {
      from = client.senderDefault ||
        this.configService.get<string>('mail.from', { infer: true })!,
      to,
      subject = template.subject!,
      params,
      cc,
      bcc,
      context,
      text,
    } = dto;

    const sendMailDto: SendMailDto = {
      from,
      to,
      cc,
      bcc,
      subject,
      context,
      text,
      metadata: params,
    };

    if (template.file) {
      sendMailDto.template = template.filename;
    } else if (template.html) {
      sendMailDto.html = template.html;
    } else {
      throw new NotFoundException(
        `Not found a valid template with ID: ${templateCode}`,
      );
    }

    const paramsIsValid = validateTemplateVariables(
      template.variables,
      params || {},
    );

    if (!paramsIsValid.isValid) {
      throw new ValidationException(
        `There are invalid parameters.`,
        'VALIDATION_PARAMS_TEMPLATE_ERROR',
        {
          details: paramsIsValid.errors,
        },
      );
    }

    const sended = await this.mailsService.send(sendMailDto);

    if (!sended.queued) {
      const sent = await this.create(dto, clientId);

      return {
        message: `The email has been successfully sent to the email: ${to}`,
        data: sent,
      };
    }

    throw new ValidationException(
      `An error occurred while attempting to send the email to ${to}; a retry will be attempted in a few minutes.`,
      'MAIL_SEND_FAILED',
    );
  }
}
