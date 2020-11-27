import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, Injectable } from '@nestjs/common';
import { SessionData, Store } from 'express-session';
import { SessionsService } from './sessions.service';
import { ExpressSessionDataDto } from './dto/update-session.dto';

@Injectable()
export class SessionsStore extends Store {
  private readonly logger: Logger;

  constructor(
    private sessionsService: SessionsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly parentLogger: Logger,
  ) {
    super();
    this.logger = this.parentLogger.child({
      namespace: `Provider:${SessionsStore.name}`,
    });
  }

  destroy(sid: string, callback: (err?: any) => void) {
    this.logger.verbose(`Destroying a session... `);
    this.logger.debug(`Session id: ${sid}`);

    return this.sessionsService
      .remove(sid)
      .then(() => callback(null))
      .then(() => this.logger.verbose(`Session destroyed successfully`))
      .catch(callback);
  }

  get(
    sid: string,
    callback: (err?: any, session?: SessionData | null) => void,
  ) {
    this.logger.verbose(`get()`);
    this.logger.verbose(`Getting a session...`);
    this.logger.debug(`Session id: ${sid}`);

    return this.sessionsService
      .findOne(sid)
      .then(v => JSON.parse(v.data))
      .then(v => {
        callback(null, v);
        this.logger.verbose(`Get the session successfully`);
        this.logger.debug(`Got session: ${JSON.stringify(v, null, 2)}`);
        this.logger.verbose(`End of get()`);
      })
      .catch(callback);
  }

  set(
    sid: string,
    session: ExpressSessionDataDto,
    callback: (err?: any) => void,
  ) {
    this.logger.verbose(`set()`);
    this.logger.verbose(`Setting a session...`);
    this.logger.debug(`Session: ${JSON.stringify(session, null, 2)}`);

    return this.sessionsService
      .update(sid, session, {
        userId: session.user ? session.user.id : undefined,
      })
      .then(() => {
        callback(null);
        this.logger.verbose(`Set the session successfully`);
        this.logger.verbose(`End of set()`);
      })
      .catch(callback);
  }

  touch(
    sid: string,
    session: ExpressSessionDataDto,
    callback: (err?: any) => void,
  ) {
    this.logger.verbose(`Touching a session`);
    this.logger.debug(`Session: ${JSON.stringify(session, null, 2)}`);

    return this.set(sid, session, callback);
  }
}
