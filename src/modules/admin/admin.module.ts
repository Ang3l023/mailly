import { Module } from '@nestjs/common';
import { ClientAdminModule } from './client/client.module';

@Module({
  imports: [ClientAdminModule],
})
export class AdminModule {}
