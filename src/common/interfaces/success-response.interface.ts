export interface SuccessResponse<T = any> {
  statusCode: number;
  message: string;
  meta?: any;
  data: T;
  requestId: string;
  timestamp: string;
  path: string;
}
