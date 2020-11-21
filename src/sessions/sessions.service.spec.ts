import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { SessionsService } from './sessions.service';
import { User } from 'src/users/entities/user.entity';

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

  describe('findAll()', () => {
    it('should return all sessions of given user id', async () => {
      const sessions: Session[] = [];

      jest.spyOn(sessionsRepository, 'find').mockResolvedValue(sessions);

      await expect(service.findAll(1)).resolves.toBe(sessions);
      expect(sessionsRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return a session', async () => {
      const session: Session = {} as Session;

      jest.spyOn(sessionsRepository, 'findOne').mockResolvedValue(session);

      await expect(service.findOne('1')).resolves.toBe(session);
      expect(sessionsRepository.findOne).toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should return created session', async () => {
      const createSessionDto = { email: '', password: '' };
      const session = { cookie: { _expires: 10 } };

      jest.spyOn(sessionsRepository, 'save').mockResolvedValue(session as any);
      jest
        .spyOn(authService, 'authenticate')
        .mockResolvedValue({ id: 1 } as User);

      await expect(
        service.create('1', createSessionDto, session),
      ).resolves.toBe(session);
      expect(sessionsRepository.save).toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should return updated session', async () => {
      const session: UpdateSessionDto = {
        data: { cookie: { _expires: 10 } },
        userId: 1,
      };

      jest.spyOn(sessionsRepository, 'save').mockResolvedValue(session as any);

      await expect(service.update('id', session)).resolves.toBe(session);
      expect(sessionsRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should return deleted session id', async () => {
      const id = 'id';

      jest.spyOn(sessionsRepository, 'save').mockResolvedValue({ id } as any);

      await expect(service.remove(id)).resolves.toBe(id);
      expect(sessionsRepository.save).toHaveBeenCalled();
    });
  });
});
