import { Global, Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { Client } from '../database/entities/client.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsRepository } from './repositories/clients.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Client])],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
  exports: [ClientsService, ClientsRepository],
})
export class ClientsModule {}
