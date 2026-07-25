import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Template } from './template.entity';
import { ETypeVariable } from '../../common/enums/variable/type.enum';
import { VariableOptions } from './variable-options';
import { VariableRules } from './variable-rules';

@Entity()
export class Variable extends BaseEntity {
  @Column({ nullable: false, length: 100 })
  name!: string;

  @Column({ length: 150, type: String, nullable: true })
  label?: string | null;

  @Column({
    type: 'enum',
    enum: ETypeVariable,
    default: ETypeVariable.STRING,
  })
  type!: ETypeVariable;

  @Column({ type: 'text', nullable: true })
  defaultValue?: string | null;

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ default: false })
  isUnique!: boolean;

  @Column({ default: false })
  isGlobal!: boolean;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 4,
    nullable: true,
    name: 'min_value',
  })
  minValue?: number | null;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 4,
    nullable: true,
    name: 'max_value',
  })
  maxValue?: number | null;

  @Column({ type: 'int', nullable: true, name: 'min_length' })
  minLength?: number | null;

  @Column({ type: 'int', nullable: true, name: 'max_length' })
  maxLength?: number | null;

  @Column({ length: 255, nullable: true, type: String })
  pattern?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ default: true, name: 'is_active' })
  isActive!: boolean;

  @ManyToMany(() => Template, (template) => template.variables)
  templates!: Template[];

  @OneToMany(() => VariableOptions, (opts) => opts.variable)
  options!: VariableOptions[];

  @OneToMany(() => VariableRules, (rules) => rules.variable)
  rules!: VariableRules[];
}
