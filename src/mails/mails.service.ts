import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { ISendMailCustom } from './interfaces/send-mail-custom.interface';
import {
  IErrorMailer,
  IHandleErrorMail,
} from './interfaces/error-mail.interface';

@Injectable()
export class MailsService {
  private readonly logger = new Logger(MailsService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeMail(to: string, from?: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        from,
        subject: 'Welcome to Mailly',
        text: 'Hello, thank you for registered',
      });
    } catch (error) {
      this.logger.error('Error while sending welcome mail', error);
      throw new Error('Mail has not been sent');
    }
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
        this.handleErrorMail(error as IErrorMailer, dto.code!).message,
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
    mailCode: string,
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
}
