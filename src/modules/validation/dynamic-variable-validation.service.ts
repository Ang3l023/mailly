import { Injectable } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';
import {
  ValidationResult,
  VariableToValidate,
} from '../../types/variable-validation.types';
import { validateTemplateVariables } from '../../common/utils/validate-template-variables';
import { getRequestContext } from '../../common/context/request-context';
import { ValidationException } from '../../exceptions/validation.exception';

@Injectable()
export class DynamicVariableValidationService {
  constructor(private readonly logService: LogsService) {}

  /**
   * Valida los valores contra las variables de una plantilla.
   * Lanza ValidationException si hay errores.
   * Retorna los valores sanitizados (con defaults aplicados).
   */
  async validateOrFail(
    variables: VariableToValidate[],
    values: Record<string, any>,
    options?: {
      templateId?: number;
      context?: string;
    },
  ): Promise<Record<string, any>> {
    const result: ValidationResult = validateTemplateVariables(
      variables,
      values,
    );

    if (!result.isValid) {
      const { requestId, clientId, ipAddress, userAgent } = getRequestContext();

      // Log informativo (es un error controlado, no crítico)
      await this.logService.warn(
        'DYNAMIC_VARIABLE_VALIDATION_FAILED',
        'Falló la validación de variables dinámicas',
        {
          context: options?.context || 'DynamicVariableValidationService',
          entityType: 'template',
          entityId: options?.templateId,
          requestId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          client: clientId
            ? ({
                id: clientId,
              } as any)
            : undefined,
          ipAddress,
          userAgent,
          metadata: {
            errors: result.errors,
            receivedKeys: Object.keys(values),
          },
        },
      );

      throw new ValidationException(
        'Error en la validación de variables de la plantilla',
        'TEMPLATE_VARIABLE_VALIDATION',
        {
          errors: result.errors,
        },
      );
    }

    return result.sanitizedValues;
  }

  /**
   * Solo valida y devuelve el resultado (no lanza excepción).
   * Útil cuando quieres manejar los errores manualmente.
   */
  validate(
    variables: VariableToValidate[],
    values: Record<string, any>,
  ): Record<string, any> {
    return validateTemplateVariables(variables, values);
  }
}
