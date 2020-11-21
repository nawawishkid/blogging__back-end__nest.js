import debugPkg from 'debug';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const debug = debugPkg('blogging:module:users:decorator');

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    debug('get user from request object');
    const request = ctx.switchToHttp().getRequest();

    return request.user;
  },
);
