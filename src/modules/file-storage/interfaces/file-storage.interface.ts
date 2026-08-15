export interface UploadFileOptions {
  key: string;
  body: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
}

export interface ListFilesOptions {
  prefix?: string;
  maxKeys?: number;
}
