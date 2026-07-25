import { EValidationRuleType } from '../common/enums/variable/validation-rule-type.enum';
export interface VariableToValidate {
  name: string;
  type: string;
  isRequired: boolean;
  defaultValue?: string | null;
  minValue?: number | null;
  maxValue?: number | null;
  minLength?: number | null;
  maxLength?: number | null;
  pattern?: string | null;
  options?: { value: string; label: string }[];
  rules?: {
    ruleType: EValidationRuleType;
    ruleValue: string;
    errorMessage?: string | null;
  }[];
}

export interface ValidationError {
  variable: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedValues: Record<string, any>;
}
