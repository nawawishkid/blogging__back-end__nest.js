import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import * as session from 'express-session';

@Injectable()
export class SessionsMiddleware implements NestMiddleware {
  constructor(
    @Inject('SESSION_OPTIONS') private options: session.SessionOptions,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    session(this.options)(req, res, next);
  }
}
