import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { SentMail } from './entities/sent-mail.entity';
import { Log } from './entities/log.entity';
import { Template } from './entities/template.entity';
import { Variable } from './entities/variable.entity';
import { VariableOptions } from './entities/variable-options';
import { VariableRules } from './entities/variable-rules';
import { MailQueue } from './entities/mail-queue.entity';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
        entities: [
          Client,
          MailQueue,
          SentMail,
          Log,
          Template,
          Variable,
          VariableOptions,
          VariableRules,
        ],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
