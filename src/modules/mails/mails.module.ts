import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter';
import { join } from 'path';
import { MailsService } from './mails.service';
import { IConfigSchema } from '../../common/interfaces/config.interface';
import { TemplatesModule } from '../templates/templates.module';
import { QueueMailModule } from '../queue-mail/queue-mail.module';
import { SentMailsModule } from '../sent-mails/sent-mails.module';
import { MailCron } from './mail.cron';

@Global()
@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<IConfigSchema>) => ({
        transport: {
          host: config.get<string>('mail.host', { infer: true }),
          port: config.get('mail.port', { infer: true }),
          secure: config.get('mail.secure', { infer: true }),
          auth: {
            user: config.get<string>('mail.user', { infer: true }),
            pass: config.get<string>('mail.pass', { infer: true }),
          },
        },
        defaults: {
          from: config.get<string>('mail.from', { infer: true }),
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
    TemplatesModule,
    QueueMailModule,
    SentMailsModule,
  ],
  providers: [MailsService, MailCron],
  exports: [MailsService],
})
export class MailsModule {}
