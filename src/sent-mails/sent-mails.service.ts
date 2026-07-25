import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSentMailDto } from './dto/create-sent-mail.dto';
import { SentMailsRepository } from './repositories/sent-mails.repository';
import { EStatusSentMail } from '../common/enums/sent-mail/status.enum';
import { ClientsService } from '../clients/clients.service';
import { MailsService } from '../mails/mails.service';
import { IConfigSchema } from '../common/interfaces/config.interface';
import { TemplatesService } from '../templates/templates.service';
import { ISendMailCustom } from '../mails/interfaces/send-mail-custom.interface';
import { SentMail } from '../database/entities/sent-mail.entity';
import { validateTemplateVariables } from '../templates/utils/validate-template-variables';

@Injectable()
export class SentMailsService {
  private readonly logger = new Logger(SentMailsService.name);

  constructor(
    private readonly configService: ConfigService<IConfigSchema>,
    private readonly sentMailsRepository: SentMailsRepository,
    private readonly clientService: ClientsService,
    private readonly mailsService: MailsService,
    private readonly templateService: TemplatesService,
  ) {}

  async create(createSentMailDto: CreateSentMailDto, clientId: number) {
    const client = await this.clientService.findById(clientId);

    const { template: templateCode } = createSentMailDto;

    const template = await this.templateService.findByCodeAndClient(
      templateCode,
      clientId,
    );

    if (!createSentMailDto.subject && !template.subject) {
      throw new BadRequestException(`No valid subject has been provided.`);
    }

    let sentMailId: number | null = null;
    let sentMailCode: string | null = null;
    let sentMailStatus: EStatusSentMail | null = null;
    let sentMailMessageError: string | null = null;
    const { from, to, subject = template.subject!, params } = createSentMailDto;

    const sendMailDto: ISendMailCustom = {
      to,
      subject,
      from,
      params,
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
      throw new BadRequestException({
        message: `There are invalid parameters.`,
        errors: paramsIsValid.errors,
      });
    }

    try {
      const sentMail = await this.sentMailsRepository.create({
        from:
          from ||
          client.senderDefault ||
          this.configService.get<string>('mail.from', { infer: true }),
        to,
        subject,
        client,
        params: params ? JSON.stringify(params) : undefined,
        template: sendMailDto.template || sendMailDto.html,
      });

      sentMailId = sentMail.id;
      sentMailCode = sentMail.code;
      sentMailStatus = sentMail.status;
      sendMailDto.code = sentMail.code;
    } catch (error) {
      this.logger.error(
        `Error while saving sentMail Entity in database`,
        error,
      );
      throw new BadRequestException(
        `An error has been ocurred, please try again in a few minutes`,
      );
    }

    try {
      await this.mailsService.sendMailCustom(sendMailDto);
    } catch (error) {
      this.logger.error(
        `An error has been ocurred while sending mail to ${to}`,
        error,
      );
      sentMailStatus = EStatusSentMail.ERROR;
      sentMailMessageError = error as string;
    }

    try {
      await this.updateOne(sentMailId, clientId, {
        status: EStatusSentMail.SENT,
      });
      sentMailStatus = EStatusSentMail.SENT;
    } catch (error) {
      this.logger.error(
        `An error has been ocurred while updating status of a sent mail`,
        error,
      );
      sentMailStatus = EStatusSentMail.ERROR;
      sentMailMessageError = error as string;
    }

    return {
      code: sentMailCode,
      status: sentMailStatus,
      message: sentMailMessageError,
    };
  }

  async findAll(clientId: number): Promise<SentMail[]> {
    const client = await this.clientService.findById(clientId);

    return await this.sentMailsRepository.findByClient(client);
  }

  async findOne(id: number, clientId: number): Promise<SentMail> {
    const client = await this.clientService.findById(clientId);

    const sentMail = await this.sentMailsRepository.findOneByIdAndClient(
      id,
      client,
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

      return updated;
    } catch (error) {
      this.logger.error(
        `An error has been ocurred during update with ID: ${id}`,
        error,
      );
      throw new Error(`An error has been ocurred during update with ID: ${id}`);
    }
  }
}
