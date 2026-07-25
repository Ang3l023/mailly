import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configSchema from './config/config.schema';
import { DatabaseModule } from './database/database.module';
import { configValidationSchema } from './config/config.validation';
import { ClientsModule } from './clients/clients.module';
import { LogsModule } from './logs/logs.module';
import { SentMailsModule } from './sent-mails/sent-mails.module';
import { MailsModule } from './mails/mails.module';
import { TemplatesModule } from './templates/templates.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configSchema],
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    ClientsModule,
    LogsModule,
    SentMailsModule,
    MailsModule,
    TemplatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
