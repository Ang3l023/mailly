import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  apiKey!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  senderDefault!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
