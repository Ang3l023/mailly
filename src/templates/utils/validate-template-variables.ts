/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ValidationResult,
  VariableToValidate,
  ValidationError,
} from '../../types/variable-validation.types';
import { EValidationRuleType } from '../../common/enums/variable/validation-rule-type.enum';
import { compareDatesOnly, parseDate } from '../../common/utils/date.utils';

/**
 * Valida los valores proporcionados contra las reglas de las variables de una plantilla.
 */
export function validateTemplateVariables(
  variables: VariableToValidate[],
  values: Record<string, any>,
): ValidationResult {
  const errors: ValidationError[] = [];

  const sanitizedValues: Record<string, any> = { ...values };

  for (const variable of variables) {
    const { name } = variable;

    let value = values[name];

    // 1. Aplicar valor por defecto si no viene
    if (
      (value === undefined || value === null || value === '') &&
      variable.defaultValue != null
    ) {
      value = variable.defaultValue;
      sanitizedValues[name] = value;
    }

    // 2. Required
    if (
      variable.isRequired &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push({
        variable: variable.name,
        message: `Variable ${variable.name} is required.`,
      });
      continue;
    }
    // Si no es required y no tiene valor, saltamos el resto de validaciones
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // 3. Validación por tipo
    const typeError = validateByType(variable, value);
    if (typeError) {
      errors.push(typeError);
      continue;
    }

    // 4. Longitud (strings)
    if (typeof value === 'string') {
      if (variable.minLength != null && value.length < variable.minLength) {
        errors.push({
          variable: name,
          message: `La variable "${name}" debe tener al menos ${variable.minLength} caracteres`,
        });
      }
      if (variable.maxLength != null && value.length > variable.maxLength) {
        errors.push({
          variable: name,
          message: `La variable "${name}" no puede superar los ${variable.maxLength} caracteres`,
        });
      }
    }

    // 5. Rango numérico
    if (typeof value === 'number') {
      if (variable.minValue != null && value < variable.minValue) {
        errors.push({
          variable: name,
          message: `La variable "${name}" debe ser mayor o igual a ${variable.minValue}`,
        });
      }
      if (variable.maxValue != null && value > variable.maxValue) {
        errors.push({
          variable: name,
          message: `La variable "${name}" debe ser menor o igual a ${variable.maxValue}`,
        });
      }
    }

    // 6. Patrón (regex)
    if (variable.pattern && typeof value === 'string') {
      try {
        const regex = new RegExp(variable.pattern);
        if (!regex.test(value)) {
          errors.push({
            variable: name,
            message: `La variable "${name}" no cumple con el formato requerido`,
          });
        }
      } catch {
        errors.push({
          variable: name,
          message: `El patrón de validación de "${name}" es inválido`,
        });
      }
    }

    // 7. Opciones (enum / select)
    if (variable.type === 'enum' && variable.options?.length) {
      const allowedValues = variable.options.map((o) => o.value);
      if (!allowedValues.includes(String(value))) {
        errors.push({
          variable: name,
          message: `La variable "${name}" debe ser uno de: ${allowedValues.join(', ')}`,
        });
      }
    }

    // 8. Reglas personalizadas
    if (variable.rules?.length) {
      for (const rule of variable.rules) {
        const ruleError = applyCustomRule(variable.name, value, rule);
        if (ruleError) {
          errors.push(ruleError);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValues,
  };
}

/**
 * Validación según el tipo de la variable
 */

function validateByType(
  variable: VariableToValidate,
  value: any,
): ValidationError | null {
  const { name, type } = variable;

  switch (type) {
    case 'string':
      if (typeof value !== 'string') {
        return {
          variable: name,
          message: `La variable "${name}" debe ser un texto`,
        };
      }
      break;

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) {
        return {
          variable: name,
          message: `La variable "${name}" debe ser un número`,
        };
      }
      // Normalizamos a number
      break;
    }

    case 'boolean':
      if (
        typeof value !== 'boolean' &&
        value !== 'true' &&
        value !== 'false' &&
        value !== 1 &&
        value !== 0
      ) {
        return {
          variable: name,
          message: `La variable "${name}" debe ser verdadero o falso`,
        };
      }
      break;

    case 'date': {
      const parsed = parseDate(value);
      if (!parsed) {
        return {
          variable: name,
          message: `La variable "${name}" debe ser una fecha válida`,
        };
      }
      break;
    }

    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof value !== 'string' || !emailRegex.test(value)) {
        return {
          variable: name,
          message: `La variable "${name}" debe ser un correo válido`,
        };
      }
      break;
    }

    case 'url':
      try {
        new URL(value as string);
      } catch {
        return {
          variable: name,
          message: `La variable "${name}" debe ser una URL válida`,
        };
      }
      break;

    case 'json':
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch {
          return {
            variable: name,
            message: `La variable "${name}" debe ser un JSON válido`,
          };
        }
      } else if (typeof value !== 'object') {
        return {
          variable: name,
          message: `La variable "${name}" debe ser un objeto o JSON`,
        };
      }
      break;

    case 'enum':
      // Se valida más abajo con options
      break;

    default:
      break;
  }

  return null;
}

/**
 * Aplica reglas personalizadas definidas en validation_rules
 */

/**
 * Aplica reglas personalizadas definidas en validation_rules
 */
function applyCustomRule(
  variableName: string,
  value: any,
  rule: {
    ruleType: EValidationRuleType;
    ruleValue: string;
    errorMessage?: string | null;
  },
): ValidationError | null {
  const { ruleType, ruleValue, errorMessage } = rule;
  const defaultMessage =
    errorMessage ||
    `La variable "${variableName}" no cumple la regla "${ruleType}"`;

  switch (ruleType) {
    // ===== Números =====
    case EValidationRuleType.MIN: {
      const min = Number(ruleValue);
      if (isNaN(min) || Number(value) < min) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser mayor o igual a ${ruleValue}`,
        };
      }
      break;
    }

    case EValidationRuleType.MAX: {
      const max = Number(ruleValue);
      if (isNaN(max) || Number(value) > max) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser menor o igual a ${ruleValue}`,
        };
      }
      break;
    }

    // ===== Longitud de texto =====
    case EValidationRuleType.MIN_LENGTH: {
      const minLen = Number(ruleValue);
      if (isNaN(minLen) || String(value).length < minLen) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe tener al menos ${ruleValue} caracteres`,
        };
      }
      break;
    }

    case EValidationRuleType.MAX_LENGTH: {
      const maxLen = Number(ruleValue);
      if (isNaN(maxLen) || String(value).length > maxLen) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" no puede superar los ${ruleValue} caracteres`,
        };
      }
      break;
    }

    // ===== Expresiones regulares =====
    case EValidationRuleType.REGEX:
    case EValidationRuleType.PATTERN: {
      try {
        const regex = new RegExp(ruleValue);
        if (!regex.test(String(value))) {
          return {
            variable: variableName,
            message: defaultMessage,
          };
        }
      } catch {
        return {
          variable: variableName,
          message: `El patrón de la regla para "${variableName}" es inválido`,
        };
      }
      break;
    }

    // ===== Contenido de texto =====
    case EValidationRuleType.CONTAINS: {
      if (!String(value).includes(ruleValue)) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe contener "${ruleValue}"`,
        };
      }
      break;
    }

    case EValidationRuleType.NOT_CONTAINS: {
      if (String(value).includes(ruleValue)) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" no debe contener "${ruleValue}"`,
        };
      }
      break;
    }

    case EValidationRuleType.STARTS_WITH: {
      if (!String(value).startsWith(ruleValue)) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe comenzar con "${ruleValue}"`,
        };
      }
      break;
    }

    case EValidationRuleType.ENDS_WITH: {
      if (!String(value).endsWith(ruleValue)) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe terminar con "${ruleValue}"`,
        };
      }
      break;
    }

    // ===== Igualdad =====
    case EValidationRuleType.EQUALS: {
      if (String(value) !== ruleValue) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser igual a "${ruleValue}"`,
        };
      }
      break;
    }

    case EValidationRuleType.NOT_EQUALS: {
      if (String(value) === ruleValue) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" no debe ser igual a "${ruleValue}"`,
        };
      }
      break;
    }

    // ===== Listas =====
    case EValidationRuleType.IN: {
      const allowed = ruleValue.split(',').map((v) => v.trim());
      if (!allowed.includes(String(value))) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser uno de: ${allowed.join(', ')}`,
        };
      }
      break;
    }

    case EValidationRuleType.NOT_IN: {
      const forbidden = ruleValue.split(',').map((v) => v.trim());
      if (forbidden.includes(String(value))) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" no puede ser ninguno de: ${forbidden.join(', ')}`,
        };
      }
      break;
    }

    // ===== Fechas =====
    case EValidationRuleType.BEFORE: {
      const dateValue = parseDate(value);
      const limit = parseDate(ruleValue);

      if (!dateValue || !limit) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" o la fecha de comparación no son válidas`,
        };
      }

      if (compareDatesOnly(dateValue, limit) >= 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser anterior a ${ruleValue}`,
        };
      }
      break;
    }

    case EValidationRuleType.AFTER: {
      const dateValue = parseDate(value);
      const limit = parseDate(ruleValue);

      if (!dateValue || !limit) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" o la fecha de comparación no son válidas`,
        };
      }

      if (compareDatesOnly(dateValue, limit) <= 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser posterior a ${ruleValue}`,
        };
      }
      break;
    }

    case EValidationRuleType.BEFORE_OR_EQUAL: {
      const dateValue = parseDate(value);
      const limit = parseDate(ruleValue);

      if (!dateValue || !limit || compareDatesOnly(dateValue, limit) > 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser anterior o igual a ${ruleValue}`,
        };
      }
      break;
    }

    case EValidationRuleType.AFTER_OR_EQUAL: {
      const dateValue = parseDate(value);
      const limit = parseDate(ruleValue);

      if (!dateValue || !limit || compareDatesOnly(dateValue, limit) < 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser posterior o igual a ${ruleValue}`,
        };
      }
      break;
    }

    case EValidationRuleType.PAST: {
      const dateValue = parseDate(value);
      const today = new Date();

      if (!dateValue || compareDatesOnly(dateValue, today) >= 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser una fecha pasada`,
        };
      }
      break;
    }

    case EValidationRuleType.FUTURE: {
      const dateValue = parseDate(value);
      const today = new Date();

      if (!dateValue || compareDatesOnly(dateValue, today) <= 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser una fecha futura`,
        };
      }
      break;
    }

    case EValidationRuleType.TODAY: {
      const dateValue = parseDate(value);
      const today = new Date();

      if (!dateValue || compareDatesOnly(dateValue, today) !== 0) {
        return {
          variable: variableName,
          message:
            errorMessage ||
            `La variable "${variableName}" debe ser la fecha de hoy`,
        };
      }
      break;
    }

    // ===== Personalizado =====
    case EValidationRuleType.CUSTOM:
      // Aquí puedes extender la lógica (evaluar expresiones, llamar funciones, etc.)
      break;

    default:
      // Regla desconocida → se ignora
      break;
  }

  return null;
}
