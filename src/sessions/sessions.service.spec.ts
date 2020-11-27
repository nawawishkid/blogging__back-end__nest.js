import { createLogger, transports } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import {
  ExpressSessionDataDto,
  UpdateSessionDto,
} from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { User } from 'src/users/entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionData } from 'express-session';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';

describe('SessionsService', () => {
  let service: SessionsService,
    sessionsRepository: Repository<Session>,
    authService: AuthService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionsService,
        {
          provide: getRepositoryToken(Session),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        { provide: AuthService, useValue: { authenticate: jest.fn() } },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: createLogger({
            transports: [new transports.Console({ silent: true })],
          }),
        },
      ],
    }).compile();

    service = module.get<SessionsService>(SessionsService);
    sessionsRepository = module.get<Repository<Session>>(
      getRepositoryToken(Session),
    );
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll(userId: number)', () => {
    it('should return all sessions of given user id', async () => {
      const userId = 1;
      const sessionEntities: Session[] = [{ data: 'abc' } as Session];
      let receivedUserId;

      jest
        .spyOn(sessionsRepository, 'find')
        .mockImplementation((condition: any) => {
          receivedUserId = condition.where.userId;

          return Promise.resolve(sessionEntities);
        });

      await expect(service.findAll(userId)).resolves.toBe(sessionEntities);
      expect(receivedUserId).toEqual(userId);
    });
  });

  describe('findOne()', () => {
    it('should return a session', async () => {
      const sessionEntity: Session = {
        data: 'session',
      } as Session;

      jest
        .spyOn(sessionsRepository, 'findOne')
        .mockResolvedValue(sessionEntity);

      await expect(service.findOne('1')).resolves.toBe(sessionEntity);
    });
  });

  describe('create()', () => {
    it(`should set user ID on session object`, async () => {
      const user = { id: 1000 } as User;
      const sid = '10';
      const expressSession = ({
        cookie: { expires: new Date() },
      } as unknown) as ExpressSessionDataDto;

      jest.spyOn(sessionsRepository, 'save').mockResolvedValue(null);
      jest.spyOn(authService, 'authenticate').mockResolvedValue(user);

      await service.create(sid, { email: '', password: '' }, expressSession);

      expect(expressSession.user).toStrictEqual({ id: user.id });
    });

    /**
     * @TODO Test that it should serialize data field before saving to database
     */
    it('should return created session with serialized session data', async () => {
      const user: User = { id: 1 } as User;
      const createSessionDto: CreateSessionDto = { email: '', password: '' };
      const expressSession = ({
        cookie: { expires: new Date() },
      } as unknown) as ExpressSessionDataDto;
      const sid: string = '1';
      const createdSessionEntity: Session = {
        data: JSON.stringify(expressSession),
      } as Session;

      jest
        .spyOn(sessionsRepository, 'save')
        .mockResolvedValue(createdSessionEntity);
      jest.spyOn(authService, 'authenticate').mockResolvedValue(user);

      await expect(
        service.create(sid, createSessionDto, expressSession),
      ).resolves.toBe(createdSessionEntity);
    });

    it(`should throw if given user credential is invalid`, async () => {
      const createSessionDto: CreateSessionDto = { email: '', password: '' };
      const expressSession = ({
        cookie: { expires: new Date() },
      } as unknown) as ExpressSessionDataDto;
      const sid: string = '1';
      const createdSessionEntity: Session = {
        data: JSON.stringify(expressSession),
      } as Session;
      const error = new Error('ok');

      jest
        .spyOn(sessionsRepository, 'save')
        .mockResolvedValue(createdSessionEntity);
      jest.spyOn(authService, 'authenticate').mockRejectedValue(error);

      await expect(
        service.create(sid, createSessionDto, expressSession),
      ).rejects.toThrow(error);
    });
  });

  describe('update()', () => {
    it('should return updated session with serialized session data', async () => {
      const sid = 'hahaha';
      const expressSession: SessionData = {
        cookie: { expires: new Date() },
      } as SessionData;
      const updateSessionDto: UpdateSessionDto = {
        isRevoked: true,
      };

      jest
        .spyOn(sessionsRepository, 'save')
        .mockImplementation(entity => Promise.resolve(entity as Session));

      const updatedSessionEntity = await service.update(
        sid,
        expressSession,
        updateSessionDto,
      );

      expect(updatedSessionEntity).toEqual(
        expect.objectContaining({
          id: sid,
          data: JSON.stringify(expressSession),
          isRevoked: updateSessionDto.isRevoked,
        }),
      );
    });
  });

  describe('remove()', () => {
    it('should return revoked session id', async () => {
      const id = 'id';

      jest
        .spyOn(sessionsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);

      await expect(service.remove(id)).resolves.toBe(id);
    });

    it(`should throw SessionNotFoundException`, () => {
      jest
        .spyOn(sessionsRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(service.remove('abc')).rejects.toThrow(
        SessionNotFoundException,
      );
    });
  });
});
