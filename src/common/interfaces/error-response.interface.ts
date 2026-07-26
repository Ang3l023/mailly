export interface IErrorResponse {
  statusCode: number;
  errorCode: string;
  message: string | string[];
  requestId: string;
  timestamp: string;
  path: string;
  details?: Record<string, any>;
}
