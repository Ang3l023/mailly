import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VariableRepository } from './repositories/variable.repository';
import { Variable } from '../../database/entities/variable.entity';
import { FindOptionsWhere, In } from 'typeorm';
import { CreateVariableDto } from './dto/create-variable.dto';
import { CreateVariableOptionDto } from './dto/create-variable-option.dto';
import { VariableOptions } from '../../database/entities/variable-options';
import { VariableOptionRepository } from './repositories/variable-option.repository';
import { VariableRuleRepository } from './repositories/variable-rule.repository';
import { CreateVariableRuleDto } from './dto/create-variable-rule.dto';
import { VariableRules } from '../../database/entities/variable-rules';
import {
  UpdateVariableDto,
  UpdateVariableOptionDto,
  UpdateVariableRuleDto,
} from './dto/update-variable.dto';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ValidationException } from '../../exceptions/validation.exception';
import { EValidationRuleType } from '../../common/enums/variable/validation-rule-type.enum';

@Injectable()
export class VariableService {
  private readonly logger = new Logger();
  constructor(
    private readonly variableRepository: VariableRepository,
    private readonly variableOptionRepository: VariableOptionRepository,
    private readonly variableRuleRepository: VariableRuleRepository,
  ) {}

  async findPaginated(
    paginationDto: PaginationDto,
    where?: FindOptionsWhere<Variable>,
  ): Promise<PaginatedResult<Variable>> {
    return this.variableRepository.findPaginated({
      pagination: paginationDto,
      where,
      searchFields: [
        'name',
        'label',
        'type',
        'description',
        'isRequired',
        'isActive',
      ],
      relations: {
        options: true,
        rules: true,
      },
      orderBy: {
        options: {
          sortOrder: 'asc',
          label: 'asc',
        },
        rules: {
          sortOrder: 'desc',
        },
      },
    });
  }

  async findOne(variableId: number): Promise<Variable> {
    const variable = await this.variableRepository.findById(variableId);

    if (!variable) throw new NotFoundException();

    return variable;
  }

  async findByIds(ids: number[]): Promise<Variable[]> {
    return this.variableRepository.findAll({ where: { id: In(ids) } });
  }

  async create(variableDto: CreateVariableDto): Promise<Variable> {
    try {
      const { options = [], rules = [], ...variableData } = variableDto;

      const created = await this.variableRepository.create(variableData);

      if (options.length > 0 || rules.length > 0) {
        await this.registerOrUpdateOptionsAndRules(created.id, {
          options,
          rules,
        });
      }

      return created;
    } catch (error) {
      this.logger.error(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      throw new ValidationException(error.message);
    }
  }

  async update(id: number, updateDto: UpdateVariableDto): Promise<Variable> {
    try {
      const { options = [], rules = [], ...variableData } = updateDto;

      await this.findOne(id);

      await this.registerOrUpdateOptionsAndRules(id, {
        options,
        rules,
      });

      const updated = await this.variableRepository.update(id, {
        ...variableData,
      });

      return updated!;
    } catch (error) {
      this.logger.error(error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      throw new ValidationException(error.message);
    }
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);

    await this.variableRepository.delete(id);
  }

  async findOneOption(id: number): Promise<VariableOptions> {
    const option = await this.variableOptionRepository.findById(id);

    if (!option) throw new NotFoundException();

    return option;
  }

  async existOption(
    variableId: number,
    label: string,
    value: string,
  ): Promise<VariableOptions | null> {
    return await this.variableOptionRepository.findOne({
      where: {
        variable: {
          id: variableId,
        },
        label: label.toLowerCase().trim(),
        value: value.toLowerCase().trim(),
      },
    });
  }

  async createOption(
    optionDto: CreateVariableOptionDto,
  ): Promise<VariableOptions> {
    const variable = await this.findOne(optionDto.variableId);

    return await this.variableOptionRepository.create({
      ...optionDto,
      variable,
    });
  }

  async updateOption(
    id: number,
    optionDto: UpdateVariableOptionDto,
  ): Promise<VariableOptions> {
    await this.findOneOption(id);

    return (await this.variableOptionRepository.update(id, optionDto))!;
  }

  async deleteOption(id: number): Promise<void> {
    await this.findOneOption(id);

    await this.variableOptionRepository.delete(id);
  }

  async registerOptions(
    createOptionsDto: CreateVariableOptionDto[],
  ): Promise<VariableOptions[]> {
    const options: (VariableOptions | null)[] = await Promise.all(
      createOptionsDto.map(async (dto) => {
        try {
          return await this.createOption(dto);
        } catch (e) {
          this.logger.error(
            `Not found a variable with ID:${dto.variableId}`,
            JSON.stringify(e),
          );
          return null;
        }
      }),
    );

    return options.filter((opts) => opts !== null);
  }

  async findOneRule(id: number): Promise<VariableRules> {
    const rule = await this.variableRuleRepository.findById(id);

    if (!rule) throw new NotFoundException();

    return rule;
  }

  async existRule(
    variableId: number,
    ruleType: EValidationRuleType,
    ruleValue: string,
  ): Promise<VariableRules | null> {
    return await this.variableRuleRepository.findOne({
      where: {
        variable: {
          id: variableId,
        },
        ruleType,
        ruleValue: ruleValue.toLowerCase().trim(),
      },
    });
  }

  async createRule(ruleDto: CreateVariableRuleDto): Promise<VariableRules> {
    const variable = await this.findOne(ruleDto.variableId);

    return await this.variableRuleRepository.create({
      ...ruleDto,
      variable,
    });
  }

  async updateRule(
    id: number,
    ruleDto: UpdateVariableRuleDto,
  ): Promise<VariableRules> {
    await this.findOneRule(id);

    return (await this.variableRuleRepository.update(id, ruleDto))!;
  }

  async deleteRule(id: number): Promise<void> {
    await this.findOneRule(id);

    await this.variableRuleRepository.delete(id);
  }

  async registerRules(
    createRulesDto: CreateVariableRuleDto[],
  ): Promise<VariableRules[]> {
    const rules: (VariableRules | null)[] = await Promise.all(
      createRulesDto.map(async (rule) => {
        try {
          return await this.createRule(rule);
        } catch (e) {
          this.logger.error(
            `An error occurred while creating variable rule: ${rule.variableId}`,
            JSON.stringify(e),
          );
          return null;
        }
      }),
    );

    return rules.filter((r) => r !== null);
  }

  async registerOrUpdateOptionsAndRules(
    variableId: number,
    dto: {
      options: CreateVariableOptionDto[];
      rules: CreateVariableRuleDto[];
    },
  ): Promise<[VariableOptions[], VariableRules[]]> {
    const { options: optsData = [], rules: rulesData = [] } = dto;

    const [options, rules] = await Promise.all([
      Promise.all(
        optsData?.map(async (option) => {
          if (option.id) {
            try {
              await this.findOneOption(option.id);

              return await this.updateOption(option.id, { ...option });
            } catch (e) {
              this.logger.error(`Not found option with ID:${option.id}`, e);
            }
          }

          const exist = await this.existOption(
            variableId,
            option.label,
            option.value,
          );
          if (exist) return await this.updateOption(exist.id, { ...option });

          return await this.createOption({ ...option, variableId });
        }),
      ),
      Promise.all(
        rulesData?.map(async (rule) => {
          if (rule.id) {
            try {
              await this.findOneRule(rule.id);

              return await this.updateRule(rule.id, { ...rule });
            } catch (e) {
              this.logger.error(`Not found a rule with ID:${rule.id}`, e);
            }
          }

          const exist = await this.existRule(
            variableId,
            rule.ruleType,
            rule.ruleValue,
          );
          if (exist) return await this.updateRule(exist.id, { ...rule });

          return await this.createRule({ ...rule, variableId });
        }),
      ),
    ]);

    return [options, rules];
  }
}
