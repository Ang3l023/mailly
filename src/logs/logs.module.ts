import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Log } from '../database/entities/log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsRepository } from './repositories/logs.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogsService, LogsRepository],
  exports: [LogsService, LogsRepository],
})
export class LogsModule {}
