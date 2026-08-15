import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTemplatesDto {
  clientId!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  code?: number | null;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name!: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  subject?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(3)
  html?: string | null;

  @IsNotEmpty({ each: true })
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  variablesIds!: number[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
