import {
  forwardRef,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import { LogsService } from '../logs/logs.service';
import { IConfigSchema } from '../../common/interfaces/config.interface';
import { getRequestContext } from '../../common/context/request-context';
import {
  MailQueue,
  MailStatus,
} from '../../database/entities/mail-queue.entity';
import { TemplatesService } from '../templates/templates.service';
import { QueueMailService } from '../queue-mail/queue-mail.service';
import { SendMailDto } from './dto/send-mail.dto';
import { IResponseSendMail } from './interfaces/send-mail-response.interface';
import { ISendMailCustom } from './interfaces/send-mail-custom.interface';
import {
  IErrorMailer,
  IHandleErrorMail,
} from './interfaces/error-mail.interface';
import { IProcessPendingResponse } from './interfaces/process-pending.interface';
import { SentMailsService } from '../sent-mails/sent-mails.service';
import { FileStorageService } from '../file-storage/file-storage.service';
import { FileStorageError } from '../file-storage/errors/file-storage.errors';
import { S3ServiceException } from '@aws-sdk/client-s3';
import Mail from 'nodemailer/lib/mailer';
import {
  S3_FILENAME_FROM_PATH,
  S3_PATH,
} from '../../common/constants/s3-path.constant';

@Injectable()
export class MailsService {
  private readonly logger = new Logger(MailsService.name);
  private isActive: boolean = true;

  constructor(
    private readonly queueMailService: QueueMailService,
    private readonly configService: ConfigService<IConfigSchema>,
    private readonly mailerService: MailerService,
    private readonly logService: LogsService,
    private readonly templateService: TemplatesService,
    @Inject(forwardRef(() => SentMailsService))
    private readonly sentMailService: SentMailsService,
    private readonly fileStorageService: FileStorageService,
  ) {
    this.isActive = configService.get('mail.enabled', { infer: true })!;
  }

  /**
   * Punto de entrada principal.
   * Si el envío está desactivado → guarda en cola.
   * Si está activado → intenta enviar.
   */
  async send(dto: SendMailDto): Promise<IResponseSendMail> {
    let html = dto.html;

    if (dto.html && dto.metadata) {
      html = this.replaceVariablesHtml(dto.html, dto.metadata);
    }

    if (!this.isActive) {
      const queued = await this.enqueue(dto, html);
      return { queued: true, id: queued.id };
    }

    try {
      await this.sendNow(dto);
      return { queued: false };
    } catch (error) {
      const handled = this.handleErrorMail(error as IErrorMailer);

      // Si falla el envío real, lo guardamos como pendiente para reintento
      const queued = await this.enqueue(dto, handled.details);
      return { queued: true, id: queued.id };
    }
  }

  /**
   * Envío real inmediato
   */
  async sendNow(dto: SendMailDto): Promise<void> {
    const { requestId, clientId } = getRequestContext();

    try {
      if (!this.isActive) {
        await this.logService.info(
          'MAIL_PENDING',
          `Correo enviado a ${dto.to}`,
          {
            context: 'MailService',
            requestId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            client: clientId
              ? ({
                  id: clientId,
                } as any)
              : undefined,
            metadata: {
              subject: dto.subject,
              template: dto.templateCode,
              to: dto.to,
              context: dto.context || {},
              text: dto.text,
            },
          },
        );
      }
      if (dto.fileContent) {
        const compileTemplate = Handlebars.compile(dto.fileContent);

        const html = compileTemplate(dto.metadata);

        this.logger.log(
          `[SEND_MAIL][TEMPLATE:FILE][TO:${dto.to}][SUBJECT:${dto.subject}][ATTACHMENTS:${dto.attachments?.map((f) => f.filename).join(',') ?? 'NO_ATTACHMENTS'}]`,
        );

        await this.mailerService.sendMail({
          to: dto.to,
          cc: dto.cc,
          bcc: dto.bcc,
          subject: dto.subject,
          html,
          text: dto.text,
          attachments: dto.attachments?.map((attachment) => ({
            filename: attachment.filename,
            content:
              typeof attachment.content === 'string'
                ? Buffer.from(attachment.content, 'base64')
                : attachment.content,
            contentType: attachment.contentType,
          })),
        });
      } else {
        const html = this.replaceVariablesHtml(dto.html!, dto.metadata);

        this.logger.log(
          `[SEND_MAIL][TEMPLATE:HTMl][TO:${dto.to}][SUBJECT:${dto.subject}][ATTACHMENTS:${dto.attachments?.map((f) => f.filename).join(',') ?? 'NO_ATTACHMENTS'}]`,
        );

        await this.mailerService.sendMail({
          to: dto.to,
          cc: dto.cc,
          bcc: dto.bcc,
          subject: dto.subject,
          html,
          text: dto.text,
          attachments: dto.attachments?.map((attachment) => ({
            filename: attachment.filename,
            content:
              typeof attachment.content === 'string'
                ? Buffer.from(attachment.content, 'base64')
                : attachment.content,
            contentType: attachment.contentType,
          })),
        });
      }

      await this.logService.info('MAIL_SENT', `Correo enviado a ${dto.to}`, {
        context: 'MailService',
        requestId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        client: clientId
          ? ({
              id: clientId,
            } as any)
          : undefined,
        metadata: {
          subject: dto.subject,
          template: dto.templateCode,
          to: dto.to,
        },
      });
    } catch (error: any) {
      const handled = this.handleErrorMail(error as IErrorMailer);
      await this.logService.error('MAIL_SEND_FAILED', handled.message, {
        context: 'MailService',
        requestId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        client: clientId
          ? ({
              id: clientId,
            } as any)
          : undefined,
        metadata: {
          subject: dto.subject,
          to: dto.to,
          template: dto.templateCode,
          params: dto.metadata,
        },
        stackTrace: handled.details,
      });
      throw new Error(handled.message);
    }
  }

  /**
   * Guarda el correo en cola (envío apagado o fallo)
   */
  private async enqueue(
    dto: SendMailDto,
    errorMessage?: string,
  ): Promise<MailQueue> {
    const { requestId, clientId } = getRequestContext();

    let finalHtml = dto.html;

    if (dto.html && dto.metadata) {
      finalHtml = this.replaceVariablesHtml(dto.html, dto.metadata);
    }

    const template = await this.templateService.findByCodeAndClient(
      dto.templateCode!,
      clientId!,
    );

    const attachedFiles: string[] = [];

    if (dto.attachments && dto.attachments.length > 0) {
      await Promise.all(
        dto.attachments.map(async (attachment) => {
          const fileKey = S3_PATH.ATTACHMENTS_QUEUE(attachment.filename);
          await this.fileStorageService.upload({
            key: fileKey,
            body: attachment.content,
            contentType: attachment.contentType ?? 'application/octet-stream',
          });
          attachedFiles.push(fileKey);
        }),
      );
    }

    const saved = await this.queueMailService.create({
      from: dto.from,
      to: dto.to,
      cc: Array.isArray(dto.cc) ? dto.cc.join(',') : dto.cc,
      bcc: Array.isArray(dto.bcc) ? dto.bcc.join(',') : dto.bcc,
      subject: dto.subject,
      html: finalHtml,
      template: template.id,
      errorMessage: errorMessage || undefined,
      metadata: dto.metadata,
      attachedFiles,
    });

    this.logger.warn(
      `Correo encolado (id=${saved.id}) hacia ${dto.to} — envío desactivado o fallido`,
    );

    await this.logService.warn('MAIL_PENDING', `Correo enviado a ${dto.to}`, {
      context: 'MailService',
      requestId,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      client: clientId ? ({ id: clientId } as any) : undefined,
      metadata: {
        subject: dto.subject,
        template: dto.templateCode,
        to: dto.to,
        params: dto.metadata,
      },
    });

    return saved;
  }

  async sendMailCustom(dto: ISendMailCustom): Promise<void> {
    const { to, from, subject, html, template, params } = dto;

    const sendMailOptions: ISendMailOptions = {
      to,
      from,
      subject,
    };

    if (html) {
      sendMailOptions.html = this.replaceVariablesHtml(html, params);
    } else if (template) {
      sendMailOptions.template = template;
      sendMailOptions.context = params;
    }

    try {
      await this.mailerService.sendMail(sendMailOptions);
    } catch (error) {
      this.logger.error('Error while sending welcome mail', error);
      throw new Error(
        this.handleErrorMail(error as IErrorMailer, dto.code).message,
      );
    }
  }

  replaceVariablesHtml(
    html: string,
    params?: Record<string, string | number>,
  ): string {
    let htmlReplaced = html;

    if (params) {
      Object.keys(params).forEach((key) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlReplaced = htmlReplaced.replace(regex, String(params[key]));
      });
    }

    return htmlReplaced;
  }

  private handleErrorMail(
    error: IErrorMailer,
    mailCode?: string,
  ): IHandleErrorMail {
    this.logger.error(`--- DETAILS ERROR SENDING EMAIL ---`);
    this.logger.error(`SentMail Code: ${mailCode}`);
    this.logger.error(`Code Error: ${error.code}`);
    this.logger.error(`Response code SMTP: ${error.responseCode}`);
    this.logger.error(`Command: ${error.command}`);
    this.logger.error(error);
    this.logger.error('-------------------------------------');

    const handleError: IHandleErrorMail = {
      code: error.code,
      details:
        'An unexpected error occurred while attempting to send the email.',
      message:
        'An unexpected error occurred while attempting to send the email. please try again in a few minutes',
      httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };

    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      handleError.details =
        'Could not connect to the mail server. Please try again later.';
      handleError.httpCode = HttpStatus.GATEWAY_TIMEOUT;
    }

    if (error.code === 'EAUTH' || error.responseCode === 535) {
      handleError.details = 'Authentication error in the messaging service.';
      handleError.httpCode = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    if (
      error.responseCode === 550 ||
      error.responseCode === 553 ||
      error.code === 'EENVELOPE'
    ) {
      handleError.details =
        "The recipient's email address is invalid or does not exist.";
      handleError.httpCode = HttpStatus.BAD_REQUEST;
    }

    if (error.responseCode === 552 || error.responseCode === 554) {
      handleError.details =
        "The message was rejected by the mail server's policies.";
      handleError.httpCode = HttpStatus.BAD_REQUEST;
    }

    return handleError;
  }

  /**
   * Procesa los correos pendientes (lo usa el cron)
   */
  async processPendingMails(): Promise<IProcessPendingResponse> {
    const pending = await this.queueMailService.findAll({
      where: { status: MailStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: 100,
      relations: {
        template: true,
        client: true,
      },
    });

    let sent = 0;
    let failed = 0;

    for (const mail of pending) {
      try {
        let html = mail.html;

        if (mail.html && mail.metadata && mail.metadata.length > 0) {
          html = this.replaceVariablesHtml(
            mail.html,
            mail.metadata
              ? (JSON.parse(mail.metadata) as {
                  [name: string]: any;
                })
              : {},
          );
        }

        if (mail.template && mail.template.file) {
          const fileContent = await this.fileStorageService.getStringBuffer(
            mail.template.file,
          );

          const compileTemplate = Handlebars.compile(fileContent);

          html = compileTemplate(
            mail.metadata
              ? (JSON.parse(mail.metadata) as {
                  [name: string]: any;
                })
              : {},
          );
        }

        const attachedFiles: Mail.Attachment[] = [];

        if (mail.attachedFiles && mail.attachedFiles.length > 0) {
          await Promise.all(
            mail.attachedFiles.map(async (attached) => {
              try {
                const file = await this.fileStorageService.get(attached);

                attachedFiles.push({
                  filename: S3_FILENAME_FROM_PATH.ATTACHMENTS_QUEUE(attached),
                  content: Buffer.from(await file.Body!.transformToByteArray()),
                  contentType: file.ContentType,
                });
              } catch (error) {
                if (error instanceof FileStorageError) {
                  this.logger.error(
                    `[ERROR][GET_FILE_STORAGE][URL:${attached}][${error.message}][${error.stack}]`,
                  );
                } else if (error instanceof S3ServiceException) {
                  this.logger.error(
                    `[ERROR][GET_FILE_STORAGE][URL:${attached}][${error.message}]`,
                  );
                } else {
                  this.logger.error(
                    `[ERROR][GET_FILE_STORAGE][URL:${attached}][${error}]`,
                  );
                }
              }
            }),
          );
        }

        await this.mailerService.sendMail({
          to: mail.to,
          cc: mail.cc || undefined,
          bcc: mail.bcc || undefined,
          subject: mail.subject,
          html,
          attachments: attachedFiles,
        });

        if (mail.attachedFiles && mail.attachedFiles.length > 0) {
          try {
            await this.fileStorageService.deleteMany(mail.attachedFiles);
          } catch (error) {
            this.logger.error(
              `[ERROR][DELETE_FILE_STORAGE][URLS:${mail.attachedFiles.join(',')}][${error}]`,
            );
          }
        }

        mail.status = MailStatus.SENT;
        mail.sentAt = new Date();
        mail.errorMessage = null;
        mail.attempts += 1;
        await this.queueMailService.updateOne(mail.id, mail);

        sent++;
      } catch (error) {
        const handled = this.handleErrorMail(error as IErrorMailer);
        mail.attempts += 1;
        mail.errorMessage = handled.details;

        // Después de 5 intentos lo marcamos como fallido
        if (mail.attempts >= 5) {
          mail.status = MailStatus.FAILED;
        }

        await this.queueMailService.updateOne(mail.id, mail);
        failed++;
        continue;
      }

      try {
        await this.sentMailService.create(
          {
            template: mail.template!.id,
            to: mail.to,
            bcc: mail.bcc ? mail.bcc?.split(',') : undefined,
            cc: mail.cc ? mail.cc.split(',') : undefined,
            client: { id: mail.client!.id },
            from: mail.from,
            params: mail.metadata
              ? (JSON.parse(mail.metadata) as Record<string, string | number>)
              : undefined,
            subject: mail.subject,
          },
          mail.client!.id,
        );
      } catch (error) {
        this.logger.error(
          `An error has been ocurred while creating register of sentMail`,
          error,
        );
      }
    }

    this.logger.log(
      `Proceso de cola finalizado: ${sent} enviados, ${failed} fallidos`,
    );

    return { sent, failed };
  }
}
