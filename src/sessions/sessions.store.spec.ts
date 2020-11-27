import { createLogger, transports } from 'winston';
import { SessionData } from 'express-session';
import { ExpressSessionDataDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { SessionsStore } from './sessions.store';

describe(`SessionStore`, () => {
  let sessionStore: SessionsStore,
    sessionsService: SessionsService = ({
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
    } as unknown) as SessionsService;

  beforeEach(() => {
    jest.restoreAllMocks();

    sessionStore = new SessionsStore(
      sessionsService,
      createLogger({ transports: [new transports.Console({ silent: true })] }),
    );
  });

  it(`get(sid, callback) should call the callback with deserialized session data`, async () => {
    const callback = jest.fn();
    const expressSession: SessionData = { cookie: {} } as SessionData;
    const serializedExpressSession = JSON.stringify(expressSession);
    const foundSessionEntity: Session = {
      data: serializedExpressSession,
    } as Session;

    jest
      .spyOn(sessionsService, 'findOne')
      .mockResolvedValue(foundSessionEntity);
    await sessionStore.get('1', callback);

    expect(callback).toBeCalledWith(null, expressSession);
  });

  it(`set(sid, session, callback) should call the callback with null`, async () => {
    const callback = jest.fn();

    jest.spyOn(sessionsService, 'update').mockResolvedValue(null);
    await sessionStore.set('1', {} as ExpressSessionDataDto, callback);

    expect(callback).toBeCalledWith(null);
  });

  it(`set(sid, session, callback) should set userId on session entity object`, async () => {
    const db = {};
    const sid = '1';
    const sessionData = ({
      user: { id: 1000 },
    } as unknown) as ExpressSessionDataDto;

    jest
      .spyOn(sessionsService, 'update')
      .mockImplementation((sid, sess, updateDto) => {
        db[sid] = { ...sess, ...updateDto };

        return Promise.resolve({} as Session);
      });

    await sessionStore.set(sid, sessionData, () => {});

    expect(db[sid].userId).toEqual(sessionData.user.id);
  });

  it(`set(sid, session, callback) should not set userId on session entity object`, async () => {
    const db = {};
    const sid = '1';
    const sessionData: ExpressSessionDataDto = {} as ExpressSessionDataDto;

    jest.spyOn(sessionsService, 'update').mockImplementation((sid, sess) => {
      db[sid] = sess;

      return Promise.resolve({} as Session);
    });

    await sessionStore.set(sid, sessionData, () => {});

    expect(db[sid].userId).toBeUndefined();
  });

  it(`set(sid, session, callback) should call the callback with error`, async () => {
    const callback = jest.fn();
    const error = 'error';

    jest.spyOn(sessionsService, 'update').mockRejectedValue(error);
    await sessionStore.set('1', {} as ExpressSessionDataDto, callback);

    expect(callback).toBeCalledWith(error);
  });

  it(`touch(sid, session, callback) should call the callback with null`, async () => {
    const callback = jest.fn();

    jest.spyOn(sessionsService, 'update').mockResolvedValue(null);
    await sessionStore.touch('1', {} as ExpressSessionDataDto, callback);

    expect(callback).toBeCalledWith(null);
  });

  it(`touch(sid, session, callbac) should call the callback with error`, async () => {
    const callback = jest.fn();
    const error = 'error';

    jest.spyOn(sessionsService, 'update').mockRejectedValue(error);
    await sessionStore.touch('1', {} as ExpressSessionDataDto, callback);

    expect(callback).toBeCalledWith(error);
  });

  it(`destroy(sid, callback) should call the callback with null`, async () => {
    const callback = jest.fn();

    jest.spyOn(sessionsService, 'remove').mockResolvedValue(null);
    await sessionStore.destroy('1', callback);

    expect(callback).toBeCalledWith(null);
  });

  it(`destroy(sid, callback) should call the callback with error`, async () => {
    const callback = jest.fn();
    const error = 'error';

    jest.spyOn(sessionsService, 'remove').mockRejectedValue(error);
    await sessionStore.destroy('1', callback);

    expect(callback).toBeCalledWith(error);
  });
});
