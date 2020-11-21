import debugPkg from 'debug';
import { Injectable } from '@nestjs/common';
import { SessionData, Store } from 'express-session';
import { SessionsService } from './sessions.service';
import { ExpressSessionDataDto } from './dto/update-session.dto';

const debug = debugPkg('blogging:module:sessions:store');

@Injectable()
export class SessionsStore extends Store {
  constructor(private sessionsService: SessionsService) {
    super();
  }

  destroy(sid: string, callback: (err?: any) => void) {
    debug('destroy session id: ', sid);
    return this.sessionsService
      .remove(sid)
      .then(() => callback(null))
      .catch(callback);
  }

  get(
    sid: string,
    callback: (err?: any, session?: SessionData | null) => void,
  ) {
    debug('get session id: ', sid);

    return this.sessionsService
      .findOne(sid)
      .then(v => JSON.parse(v.data))
      .then(v => {
        debug('session: ', JSON.stringify(v, null, 2));
        return v;
      })
      .then(v => callback(null, v))
      .catch(callback);
  }

  set(
    sid: string,
    session: ExpressSessionDataDto,
    callback: (err?: any) => void,
  ) {
    debug('set session id: ', sid);
    debug('session: ', JSON.stringify(session, null, 2));

    return this.sessionsService
      .update(sid, {
        userId: session.user ? session.user.id : undefined,
        data: session,
      })
      .then(() => callback(null))
      .catch(callback);
  }

  touch(
    sid: string,
    session: ExpressSessionDataDto,
    callback: (err?: any) => void,
  ) {
    debug('touch session id: ', sid);
    return this.set(sid, session, callback);
  }
}
