import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { SessionOptions } from 'express-session';

/**
 * @TODO Validate these configs on app startup
 */
export class AppConfigs {
  url: string;
  port: number;
  session: SessionOptions;
  cors: CorsOptions;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  logging: {
    level: string;
  };
}

export class ConfigEnv {
  URL: string;
  SESSION_SECRET: string;
  NODE_ENV: string;
  DATABASE_HOST: string;
  DATABASE_PORT: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
  DATABASE_NAME: string;
  CORS_ORIGIN: string;
  LOGGING_LEVEL?: string;
  PORT?: string;
}

export default (env: ConfigEnv) => (): AppConfigs => {
  if (!env.URL) throw new Error(`'URL' env. var is required`);

  let url = env.URL;

  url += url[url.length - 1] !== '/' ? '/' : '';

  return {
    url,
    port: parseInt(env.PORT, 10) || 3000,
    session: {
      secret: env.SESSION_SECRET.split(','),
      cookie: {
        secure: env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days,
      },
      resave: false,
      saveUninitialized: false,
    },
    cors: {
      origin: env.CORS_ORIGIN,
    },
    database: {
      host: env.DATABASE_HOST,
      port: parseInt(env.DATABASE_PORT, 10),
      username: env.DATABASE_USER,
      password: env.DATABASE_PASSWORD,
      name: env.DATABASE_NAME,
    },
    logging: {
      level: env.LOGGING_LEVEL || 'error',
    },
  };
};
