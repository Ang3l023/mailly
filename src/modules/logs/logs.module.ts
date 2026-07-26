import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './logs.service';
import { LogsRepository } from './repositories/logs.repository';
import { Log } from '../../database/entities/log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogsService, LogsRepository],
  exports: [LogsService],
})
export class LogsModule {}
