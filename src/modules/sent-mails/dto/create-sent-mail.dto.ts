import type { DeepPartial } from 'typeorm';
import { Client } from '../../../database/entities/client.entity';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSentMailDto {
  @IsOptional()
  client?: DeepPartial<Client>;

  @IsOptional()
  @IsString()
  from?: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  to!: string;

  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string | string[];

  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string | string[];

  @IsOptional()
  @IsString()
  subject?: string;

  @IsNotEmpty()
  @IsNumber()
  template!: number;

  @IsOptional()
  @Type(() => AttachedFileDto)
  @ValidateNested({ each: true })
  attachedFiles?: AttachedFileDto[];

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @IsString()
  @IsOptional()
  text?: string;

  @IsOptional()
  @IsObject()
  @Transform(({ value }): Record<string, string | number> => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value as any;
      }
    }
    return value;
  })
  params?: Record<string, string | number>;
}

export class AttachedFileDto {
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @IsNotEmpty()
  @IsString()
  content!: string | Buffer;

  @IsString()
  @IsOptional()
  contentType?: string;
}
