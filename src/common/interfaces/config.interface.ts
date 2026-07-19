export interface IConfigSchema {
  port: number;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
    synchronize: boolean;
    logging: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
  };
  mail: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    pass: string;
    secure: boolean;
    from: string;
  };
}
