import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { SessionsMiddleware } from './sessions/sessions.middleware';
import { UserMiddleware } from './users/user.middleware';
import { UsersService } from './users/users.service';
import { AppExceptionFilter } from './exception.filter';
import { tap } from 'rxjs/operators';

export async function bootstrap(app: INestApplication) {
  const logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
  const sessionMiddleware = app.get(SessionsMiddleware);
  //  new SessionsMiddleware(
  //   app.get('SESSION_OPTIONS'),
  //   logger,
  // );
  const userMiddleware = app.get(UserMiddleware);
  //  new UserMiddleware(
  //   app.get<UsersService>(UsersService),
  //   logger,
  // );
  const middlewares = [];

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
    new ValidationPipe({
      transform: true,
      validateCustomDecorators: true,
      forbidNonWhitelisted: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new AppExceptionFilter(logger));

  if (process.env.NODE_ENV !== 'production') {
    middlewares.push((req, res, next) => {
      logger.defaultMeta = {
        requestId: Date.now()
          .toString()
          .slice(13 - 6),
      };
      logger.info(`${req.method.toUpperCase()} ${req.url}`, {
        namespace: `Middleware:RequestLoggingMiddleware`,
      });
      next();
    });
    app.useGlobalInterceptors({
      intercept(ctx, next) {
        const meta = { namespace: `Interceptor:AppInterceptor` };
        const handler = () => logger.verbose(`End of intercept`, meta);
        logger.verbose(`intercept()`, meta);
        logger.debug(`Processing the request...`, meta);

        return next.handle().pipe(tap(handler, handler));
      },
    });
  }

  middlewares.push(
    sessionMiddleware.use.bind(sessionMiddleware),
    userMiddleware.use.bind(userMiddleware),
  );

  app.use(...middlewares);

  return app;
}
