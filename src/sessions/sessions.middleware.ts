import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as session from 'express-session';

@Injectable()
export class SessionsMiddleware implements NestMiddleware {
  constructor(
    @Inject('SESSION_OPTIONS') private options: session.SessionOptions,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const meta = {
      namespace: `Middleware:${SessionsMiddleware.name}`,
    };

    this.logger.debug(`use()`, meta);
    this.logger.verbose(`Initiating session of the request...`, meta);
    session(this.options)(req, res, next);
  }
}
