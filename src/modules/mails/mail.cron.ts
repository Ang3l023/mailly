import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { MailsService } from './mails.service';
import { APP_TIMEZONE, IS_PRODUCTION } from '../../common/constants/constants';

@Injectable()
export class MailCron {
  private readonly logger = new Logger(MailCron.name);

  constructor(
    private readonly mailService: MailsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Todos los días a medianoche
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: APP_TIMEZONE,
    disabled: !IS_PRODUCTION,
  })
  async handlePendingMails() {
    const mailEnabled = this.configService.get<boolean>('MAIL_ENABLED', true);

    // Solo procesamos la cola si el envío está activado
    if (!mailEnabled) {
      this.logger.warn(
        'MAIL_ENABLED=false — se omite el procesamiento de la cola',
      );
      return;
    }

    this.logger.log('Iniciando envío de correos pendientes...');

    const result = await this.mailService.processPendingMails();

    this.logger.log(
      `Cola procesada: ${result.sent} enviados, ${result.failed} fallidos`,
    );
  }
}
