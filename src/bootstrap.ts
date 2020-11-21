import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SessionsMiddleware } from './sessions/sessions.middleware';
import { UserMiddleware } from './users/user.middleware';
import { UsersService } from './users/users.service';

export async function bootstrap(app: INestApplication) {
  const sessionMiddleware = new SessionsMiddleware(app.get('SESSION_OPTIONS'));
  const userMiddleware = new UserMiddleware(
    app.get<UsersService>(UsersService),
  );

  app.use(
    sessionMiddleware.use.bind(sessionMiddleware),
    userMiddleware.use.bind(userMiddleware),
  );
  app.useGlobalPipes(
    /**
     * 'validateCustomeDecorators' option is not cited in the doc.
     * I have to read the code directly :(
     *
     * @see node_modules/@nestjs/common/pipes/validation.pipe.js
     *
     * Just opened an issue about this issue:
     * @see https://github.com/nestjs/docs.nestjs.com/issues/1566
     */
    new ValidationPipe({ transform: true, validateCustomDecorators: true }),
  );

  return app;
}
