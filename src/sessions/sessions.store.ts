import { Injectable } from '@nestjs/common';
import { Session, Store } from 'express-session';
import { Session as SessionEntity } from './entities/session.entity';
import { SessionsService } from './sessions.service';

interface ISessionStore {
  destroy(sid: string, callback: (error: Error | null) => void);
  get(
    sid: string,
    callback: (error: Error | null, session: SessionEntity) => void,
  );
  set(sid: string, session: Session, callback: (error: Error | null) => void);
  touch(sid: string, session: Session, callback: (error: Error | null) => void);
}

@Injectable()
export class SessionsStore extends Store implements ISessionStore {
  constructor(private sessionsService: SessionsService) {
    super();
  }

  destroy(sid, callback) {
    return this.sessionsService
      .remove(sid)
      .then(() => callback(null))
      .catch(callback);
  }

  get(sid, callback) {
    return this.sessionsService
      .findOne(sid)
      .then(v => callback(null, v))
      .catch(callback);
  }

  set(sid, session, callback) {
    return this.sessionsService
      .update(sid, {
        userId: session.user ? session.user.id : undefined,
        data: session,
      })
      .then(() => callback(null))
      .catch(callback);
  }

  touch(sid, session, callback) {
    return this.set(sid, session, callback);
  }
}
