import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Variable } from './variable.entity';

@Entity()
export class VariableOptions extends BaseEntity {
  @ManyToOne(() => Variable, (variable) => variable.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variable_id' })
  variable!: Variable;

  @Column({ length: 100, nullable: false })
  value!: string;

  @Column({ length: 150, nullable: true })
  label!: string;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder!: number;
}
