import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { CreateTemplatesDto } from '../../../templates/dto/create-templates.dto';

export class CreateTemplatesAdminDto extends CreateTemplatesDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  declare clientId: number;
}
