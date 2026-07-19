import { PartialType } from '@nestjs/mapped-types';
import { CreateSentMailDto } from './create-sent-mail.dto';

export class UpdateSentMailDto extends PartialType(CreateSentMailDto) {}
