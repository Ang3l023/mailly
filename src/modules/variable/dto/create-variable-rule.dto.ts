import { EValidationRuleType } from '../../../common/enums/variable/validation-rule-type.enum';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVariableRuleDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  variableId!: number;

  @IsNotEmpty()
  @IsEnum(EValidationRuleType)
  ruleType!: EValidationRuleType;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  ruleValue!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  errorMessage!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
