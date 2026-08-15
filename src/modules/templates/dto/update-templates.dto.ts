import { PartialType } from '@nestjs/mapped-types';
import { CreateTemplatesDto } from './create-templates.dto';

export class UpdateTemplatesDto extends PartialType(CreateTemplatesDto) {}
