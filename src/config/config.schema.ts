import { IConfigSchema } from '../common/interfaces/config.interface';

export default (): IConfigSchema => ({
  port: parseInt(process.env.PORT!, 10) || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT!, 10) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || '',
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
    logging: process.env.DB_LOGGING === 'true' || false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
  },
  mail: {
    enabled: process.env.MAIL_ENABLED === 'true' || false,
    host: process.env.MAIL_HOST || 'localhost',
    port: parseInt(process.env.MAIL_PORT!, 10) || 587,
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    secure: process.env.MAIL_SECURE === 'true' || false,
    from:
      process.env.MAIL_FROM || '"Soporte Mailly" <soporte.tecnico@mailly.com>',
  },
  template: {
    storagePath: process.env.TEMPLATE_STORAGE_PATH || './templates',
  },
  aws: {
    s3: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.AWS_S3_ENDPOINT || undefined,
      forcePathStyle: process.env.AWS_S3_FORCE_PATH_STYLE === 'true' || false,
      bucketName: process.env.AWS_S3_BUCKET_NAME || '',
      maxFileSize: parseInt(process.env.AWS_S3_MAX_FILE_SIZE!, 10) || 10485760, // 10MB
      allowedMimeTypes:
        process.env.AWS_S3_ALLOWED_MIME_TYPES ||
        'image/jpeg,image/png,application/pdf',
    },
  },
});
