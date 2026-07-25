import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Variable } from './variable.entity';
import { EValidationRuleType } from '../../common/enums/variable/validation-rule-type.enum';

@Entity()
export class VariableRules extends BaseEntity {
  @ManyToOne(() => Variable, (variable) => variable.rules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variable_id' })
  variable!: Variable;

  @Column({ enum: EValidationRuleType, type: 'enum' })
  ruleType!: EValidationRuleType;

  @Column({ type: 'text' })
  ruleValue!: string;

  @Column({ length: 255, nullable: true })
  errorMessage!: string;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;
}
