import debugPkg from 'debug';
import { NestMiddleware } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const debug = debugPkg('blogging:module:users:middleware');

export class UserMiddleware implements NestMiddleware {
  constructor(private usersService: UsersService) {}

  async use(req, res, next) {
    const { session } = req;

    debug(`session: `, JSON.stringify(session, null, 2));

    if (!session || !session.user || !session.user.id) {
      debug(`no session object or no user object in session object`);
      return next();
    }

    debug(`getting user...`);

    const user: User = await this.usersService.findOne(session.user.id);

    debug(`user: `, user && user.id);

    req.user = user;

    next();
  }
}
