import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'staging', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  DB_SYNCHRONIZE: Joi.boolean().default(false),
  DB_LOGGING: Joi.boolean().default(false),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_SECRET: Joi.string().required(),
  MAIL_ENABLED: Joi.boolean().default(false),
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string()
    .required()
    .when('NODE_ENV', {
      is: 'development',
      then: Joi.string().optional().allow(''),
      otherwise: Joi.string().required(),
    }),
  MAIL_PASS: Joi.string()
    .required()
    .when('NODE_ENV', {
      is: 'development',
      then: Joi.string().optional().allow(''),
      otherwise: Joi.string().required(),
    }),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_FROM: Joi.string().default(
    '"Soporte Mailly" <soporte.tecnico@mailly.com>',
  ),
});
