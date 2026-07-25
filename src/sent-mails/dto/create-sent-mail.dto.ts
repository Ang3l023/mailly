import { Client } from '../../database/entities/client.entity';
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
  client?: Client;

  @IsOptional()
  @IsString()
  from?: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  to!: string;

  @IsNotEmpty()
  @IsString()
  subject!: string;

  @IsNotEmpty()
  @IsNumber()
  template!: number;

  @IsOptional()
  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  attachedFiles?: AttachedFileDto[];

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
