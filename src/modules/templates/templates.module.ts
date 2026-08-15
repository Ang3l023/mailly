import { Module } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplatesRepository } from './repositories/templates.repository';
import { Template } from '../../database/entities/template.entity';
import { VariableModule } from '../variable/variable.module';

@Module({
  imports: [TypeOrmModule.forFeature([Template]), VariableModule],
  controllers: [TemplatesController],
  providers: [TemplatesService, TemplatesRepository],
  exports: [TemplatesService, TemplatesRepository],
})
export class TemplatesModule {}
