import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ValidationException } from './exceptions/validation.exception';

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

  app.enableCors();
  app.use(cookieParser());
  app.use(compression());
  app.use(helmet());

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
