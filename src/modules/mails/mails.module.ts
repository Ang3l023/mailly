import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsService } from './mails.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IConfigSchema } from '../../common/interfaces/config.interface';

@Module({
  imports: [
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
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
