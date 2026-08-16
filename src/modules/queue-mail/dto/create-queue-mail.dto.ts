import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateQueueMailDto {
  @IsEmail({}, { message: 'El destinatario debe ser un correo válido' })
  @IsOptional()
  from!: string;

  @IsEmail({}, { message: 'El destinatario debe ser un correo válido' })
  @IsNotEmpty()
  to!: string;

  @IsEmail({}, { each: true })
  @IsOptional()
  cc?: string | string[];

  @IsEmail({}, { each: true })
  @IsOptional()
  bcc?: string | string[];

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  subject!: string;

  /** HTML plano (si no usas plantilla .hbs) */
  @IsString()
  @IsOptional()
  html?: string;

  /** Nombre de la plantilla .hbs (sin extensión) */
  @IsNumber()
  @IsOptional()
  template?: number;

  /** Contexto para la plantilla Handlebars */
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @IsString()
  @IsOptional()
  text?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  attachedFiles?: string[] | null;
}
