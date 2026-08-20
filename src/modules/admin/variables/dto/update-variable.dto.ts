import { PartialType } from '@nestjs/mapped-types';
import { CreateVariableAdminDto } from './create-variable.dto';

export class UpdateVariableAdminDto extends PartialType(
  CreateVariableAdminDto,
) {}
