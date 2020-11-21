import { SessionOptions } from 'express-session';

interface Configs {
  port: number;
  session: SessionOptions;
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
}

export default (): Configs => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  session: {
    secret: process.env.SESSION_SECRET.split(','),
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days,
    },
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    name: process.env.DATABASE_NAME,
  },
});
