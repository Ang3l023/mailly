import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVariableOptionDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsNumber()
  variableId!: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  value!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  label!: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  sortOrder?: number;
}
