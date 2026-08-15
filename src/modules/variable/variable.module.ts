import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariableService } from './variable.service';
import { VariableController } from './variable.controller';
import { VariableRepository } from './repositories/variable.repository';
import { VariableOptionRepository } from './repositories/variable-option.repository';
import { VariableRuleRepository } from './repositories/variable-rule.repository';
import { Variable } from '../../database/entities/variable.entity';
import { VariableOptions } from '../../database/entities/variable-options';
import { VariableRules } from '../../database/entities/variable-rules';

@Module({
  imports: [
    TypeOrmModule.forFeature([Variable, VariableOptions, VariableRules]),
  ],
  controllers: [VariableController],
  providers: [
    VariableService,
    VariableRepository,
    VariableOptionRepository,
    VariableRuleRepository,
  ],
  exports: [
    VariableService,
    VariableRepository,
    VariableOptionRepository,
    VariableRuleRepository,
  ],
})
export class VariableModule {}
