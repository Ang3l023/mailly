import { VariableToValidate } from '../../types/variable-validation.types';
import { Variable } from '../../database/entities/variable.entity';

export function mapVariableToValidate(variable: Variable): VariableToValidate {
  return {
    name: variable.name,
    type: variable.type,
    isRequired: variable.isRequired,
    defaultValue: variable.defaultValue,
    minValue: variable.minValue,
    maxValue: variable.maxValue,
    minLength: variable.minLength,
    maxLength: variable.maxLength,
    pattern: variable.pattern,
    options: variable.options?.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
    rules: variable.rules?.map((rule) => ({
      ruleType: rule.ruleType,
      ruleValue: rule.ruleValue,
      errorMessage: rule.errorMessage,
    })),
  };
}

export function mapVariablesToValidate(
  variables: Variable[],
): VariableToValidate[] {
  return variables.map(mapVariableToValidate);
}
