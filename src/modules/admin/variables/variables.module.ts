import { Module } from '@nestjs/common';
import { VariablesAdminService } from './variables.service';
import { VariablesAdminController } from './variables.controller';
import { VariableModule } from '../../variable/variable.module';

@Module({
  imports: [VariableModule],
  controllers: [VariablesAdminController],
  providers: [VariablesAdminService],
})
export class VariablesAdminModule {}
