import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configSchema from './config/config.schema';
import { DatabaseModule } from './database/database.module';
import { configValidationSchema } from './config/config.validation';
import { RequestContextMiddleware } from './common/middlewares/request-context.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ClientsModule } from './modules/clients/clients.module';
import { LogsModule } from './modules/logs/logs.module';
import { SentMailsModule } from './modules/sent-mails/sent-mails.module';
import { MailsModule } from './modules/mails/mails.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { DynamicValidationModule } from './modules/validation/dynamic-validation.module';
import { QueueMailModule } from './modules/queue-mail/queue-mail.module';
import { AdminModule } from './modules/admin/admin.module';
import { VariableModule } from './modules/variable/variable.module';
import { FileStorageModule } from './modules/file-storage/file-storage.module';
import { IS_PRODUCTION } from './common/constants/constants';

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
    DynamicValidationModule,
    ...(IS_PRODUCTION ? [ScheduleModule.forRoot()] : []),
    QueueMailModule,
    AdminModule,
    VariableModule,
    FileStorageModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*path');
  }
}
