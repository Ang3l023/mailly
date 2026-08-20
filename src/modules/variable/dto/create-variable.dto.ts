import { ETypeVariable } from '../../../common/enums/variable/type.enum';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateVariableRuleDto } from './create-variable-rule.dto';
import { CreateVariableOptionDto } from './create-variable-option.dto';
import { Type } from 'class-transformer';

export class CreateVariableDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  label?: string;

  @IsNotEmpty()
  @IsEnum(ETypeVariable)
  type!: ETypeVariable;

  @IsOptional()
  @IsString()
  defaultValue?: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isUnique?: boolean;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minLength?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLength?: number;

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateVariableRuleDto)
  rules: CreateVariableRuleDto[];

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => CreateVariableOptionDto)
  options: CreateVariableOptionDto[];
}
