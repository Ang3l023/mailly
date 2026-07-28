import type { DeepPartial } from 'typeorm';
import { Client } from '../../../database/entities/client.entity';
import {
  IsArray,
  IsBase64,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

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
  @IsArray()
  @IsObject({ each: true })
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
  params?: Record<string, string | number>;
}

export class AttachedFileDto {
  @ValidateIf(
    (o: AttachedFileDto) => o.base64 !== undefined && o.base64 !== null,
  )
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @IsOptional()
  @IsString()
  @IsBase64()
  base64!: string;
}
