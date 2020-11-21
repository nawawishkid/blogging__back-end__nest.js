import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { User } from 'src/users/entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionData } from 'express-session';

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
          },
        },
        { provide: AuthService, useValue: { authenticate: jest.fn() } },
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
      const sessionEntities: Session[] = [{ data: 'abc' } as Session];

      jest.spyOn(sessionsRepository, 'find').mockResolvedValue(sessionEntities);

      await expect(service.findAll(1)).resolves.toBe(sessionEntities);
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
    /**
     * @TODO Test that it should serialize data field before saving to database
     */
    it('should return created session with serialized session data', async () => {
      const user: User = { id: 1 } as User;
      const createSessionDto: CreateSessionDto = { email: '', password: '' };
      const expressSession = { cookie: { _expires: 10 } };
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
      const expressSession = { cookie: { _expires: 10 } };
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
      const expressSession: SessionData = { cookie: {} } as SessionData;
      const updateSessionDto: UpdateSessionDto = {
        data: expressSession,
      };
      const updatedSessionEntity: Session = {
        data: JSON.stringify(expressSession),
      } as Session;

      jest
        .spyOn(sessionsRepository, 'save')
        .mockResolvedValue(updatedSessionEntity);

      await expect(service.update('id', updateSessionDto)).resolves.toBe(
        updatedSessionEntity,
      );
    });
  });

  describe('remove()', () => {
    it('should return revoked session id', async () => {
      const id = 'id';

      jest.spyOn(sessionsRepository, 'save').mockResolvedValue({ id } as any);

      await expect(service.remove(id)).resolves.toBe(id);
    });
  });
});
