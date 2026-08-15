import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsObject,
  MaxLength,
  IsNumber,
} from 'class-validator';

export class SendMailDto {
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
  templateCode?: number;

  /** Contenido del archivo adjunto (si no usas plantilla .hbs) */
  @IsOptional()
  @IsString()
  fileContent?: string;

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
}
