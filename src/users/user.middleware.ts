import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, NestMiddleware } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

export class UserMiddleware implements NestMiddleware {
  private readonly logger: Logger;

  constructor(
    private usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly parentLogger: Logger,
  ) {
    this.logger = this.parentLogger.child({
      namespace: `Middleware:${UserMiddleware.name}`,
    });
  }

  async use(req, res, next) {
    this.logger.verbose(`use()`);
    this.logger.verbose(`Assigning user object to the request object...`);
    const { session } = req;

    this.logger.debug(`Session:`, { json: session });

    if (!session || !session.user || !session.user.id) {
      this.logger.verbose(
        `No session object or the session object has no user object. Skip assigning user object to the request object`,
      );
      this.logger.verbose(`End of use()\n\n`);
      return next();
    }

    const user: User = await this.usersService.findOne(session.user.id);

    this.logger.debug(`Found user:`, { json: user });

    req.user = user;

    this.logger.verbose(`End of use()\n\n`);
    next();
  }
}
