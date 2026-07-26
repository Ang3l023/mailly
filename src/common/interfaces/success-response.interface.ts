export interface SuccessResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
  path: string;
}
