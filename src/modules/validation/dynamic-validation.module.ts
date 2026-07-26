import { Module } from '@nestjs/common';
import { DynamicVariableValidationService } from './dynamic-variable-validation.service';

@Module({
  providers: [DynamicVariableValidationService],
  exports: [DynamicVariableValidationService],
})
export class DynamicValidationModule {}
