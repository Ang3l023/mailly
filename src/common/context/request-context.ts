import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContextData {
  requestId: string;
  ipAddress: string;
  userAgent: string;
  clientId?: number | null;
}

export const requestContext = new AsyncLocalStorage<RequestContextData>();

/**
 * Obtiene el contexto actual de la petición
 */
export function getRequestContext(): RequestContextData {
  return (
    requestContext.getStore() || {
      requestId: 'unknown',
      ipAddress: 'unknown',
      userAgent: 'unknown',
      clientId: null,
    }
  );
}

/**
 * Atajo para obtener solo el requestId
 */
export function getRequestId(): string {
  return getRequestContext().requestId;
}
