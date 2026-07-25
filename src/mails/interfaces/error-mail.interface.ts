export interface IHandleErrorMail {
  message: string;
  details: string;
  code: string;
  httpCode: number;
}

export interface IErrorMailer {
  code: string;
  responseCode: number;
  command: string;
  [key: string]: any;
}
