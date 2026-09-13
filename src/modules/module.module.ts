import { Module } from '@nestjs/common';
import { ClientsModule } from './clients/clients.module';
import { LogsModule } from './logs/logs.module';
import { SentMailsModule } from './sent-mails/sent-mails.module';
import { MailsModule } from './mails/mails.module';
import { TemplatesModule } from './templates/templates.module';
import { DynamicValidationModule } from './validation/dynamic-validation.module';
import { IS_PRODUCTION } from '../common/constants/constants';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueMailModule } from './queue-mail/queue-mail.module';
import { AdminModule } from './admin/admin.module';
import { VariableModule } from './variable/variable.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { HealthController } from './health/health.controller';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [
    ClientsModule,
    LogsModule,
    SentMailsModule,
    MailsModule,
    TemplatesModule,
    DynamicValidationModule,
    ...(IS_PRODUCTION ? [ScheduleModule.forRoot()] : []),
    QueueMailModule,
    AdminModule,
    VariableModule,
    FileStorageModule,
    AuthModule,
    UserModule,
    ConfigurationModule,
  ],
  controllers: [HealthController],
})
export class ModuleModule {}
