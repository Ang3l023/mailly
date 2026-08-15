import { Module } from '@nestjs/common';
import { TemplatesAdminService } from './templates-admin.service';
import { TemplatesAdminController } from './templates-admin.controller';
import { TemplatesModule } from '../../templates/templates.module';

@Module({
  imports: [TemplatesModule],
  controllers: [TemplatesAdminController],
  providers: [TemplatesAdminService],
})
export class TemplatesAdminModule {}
