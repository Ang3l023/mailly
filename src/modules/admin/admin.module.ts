import { Module } from '@nestjs/common';
import { ClientAdminModule } from './client/client.module';
import { TemplatesAdminModule } from './templates-admin/templates-admin.module';

@Module({
  imports: [ClientAdminModule, TemplatesAdminModule],
})
export class AdminModule {}
