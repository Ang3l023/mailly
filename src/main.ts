import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationException } from './exceptions/validation.exception';
import { ConfigurationService } from './modules/configuration/configuration.service';
import { CorsDatabaseConfig } from './modules/configuration/interfaces/cors-config.interface';

type CorsOriginCallback = (err: Error | null, allow?: boolean) => void;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
      exceptionFactory: (errors) => {
        const messages = errors.flatMap((error) =>
          Object.values(error.constraints || {}),
        );

        return new ValidationException(messages, 'DTO_VALIDATION_ERROR', {
          errors,
        });
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const configService: ConfigurationService = app.get(ConfigurationService);

  const corsConfig: CorsDatabaseConfig = await configService.getCorsConfig();

  app.enableCors({
    origin: corsConfig.origins,
    methods: corsConfig.methods,
    allowHeaders: corsConfig.headers,
    credentials: true,
  });

  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
