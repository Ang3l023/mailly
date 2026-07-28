import { Module } from '@nestjs/common';
import { ClientAdminService } from './client.service';
import { ClientAdminController } from './client.controller';

@Module({
  controllers: [ClientAdminController],
  providers: [ClientAdminService],
})
export class ClientAdminModule {}
