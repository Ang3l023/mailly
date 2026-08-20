import { PartialType } from '@nestjs/mapped-types';
import { CreateVariableDto } from './create-variable.dto';
import { CreateVariableOptionDto } from './create-variable-option.dto';
import { CreateVariableRuleDto } from './create-variable-rule.dto';

export class UpdateVariableDto extends PartialType(CreateVariableDto) {}

export class UpdateVariableOptionDto extends PartialType(
  CreateVariableOptionDto,
) {}

export class UpdateVariableRuleDto extends PartialType(CreateVariableRuleDto) {}
