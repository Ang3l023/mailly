import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplatesAdminDto } from './create-templates-admin.dto';

export class UpdateTemplatesAdminDto extends PartialType(
  CreateTemplatesAdminDto,
) {}
