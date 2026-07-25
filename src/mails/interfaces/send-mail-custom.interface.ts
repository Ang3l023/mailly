export interface ISendMailCustom {
  code?: string;
  to: string;
  from?: string;
  subject: string;
  html?: string;
  template?: string;
  params?: Record<string, string | number>;
}
