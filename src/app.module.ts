import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configSchema from './config/config.schema';
import { DatabaseModule } from './database/database.module';
import { configValidationSchema } from './config/config.validation';
import { RequestContextMiddleware } from './common/middlewares/request-context.middleware';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ModuleModule } from './modules/module.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configSchema],
      validationSchema: configValidationSchema,
    }),
    DatabaseModule,
    ModuleModule,
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
