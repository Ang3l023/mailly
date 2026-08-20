import { Module } from '@nestjs/common';
import { ClientAdminModule } from './client/client.module';
import { TemplatesAdminModule } from './templates-admin/templates-admin.module';
import { VariablesAdminModule } from './variables/variables.module';

@Module({
  imports: [ClientAdminModule, TemplatesAdminModule, VariablesAdminModule],
})
export class AdminModule {}
