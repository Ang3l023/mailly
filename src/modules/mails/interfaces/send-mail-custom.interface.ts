import { Attachment } from 'nodemailer/lib/mailer';

export interface ISendMailCustom {
  code?: string;
  to: string;
  from?: string;
  subject: string;
  html?: string;
  template?: string;
  params?: Record<string, string | number>;
  attachments?: Attachment[];
}

export interface ISendMailForgotPassword {
  username: string;
  email: string;
  code: string;
  expiresInMinutes: number;
  year: number;
}
