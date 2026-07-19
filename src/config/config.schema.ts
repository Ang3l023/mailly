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
});
