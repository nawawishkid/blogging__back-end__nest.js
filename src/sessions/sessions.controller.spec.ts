import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SessionData } from 'express-session';
import { User } from '../users/entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  ExpressSessionDataDto,
  UpdateSessionDto,
} from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { EmailNotFoundException } from './exceptions/email-not-found.exception';
import { IncorrectPasswordException } from './exceptions/incorrect-password.exception';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';

describe('SessionsController', () => {
  let controller: SessionsController, sessionsService: SessionsService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionsController],
      providers: [
        {
          provide: SessionsService,
          useValue: {
            findAll: jest.fn(() => ['ok']),
            findOne: jest.fn(() => 'ok'),
            create: jest.fn(data => data),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SessionsController>(SessionsController);
    sessionsService = module.get<SessionsService>(SessionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should return all sessions of the current user', async () => {
      const user: User = { id: 1 } as User;
      const sessions = [{}] as Session[];

      jest.spyOn(sessionsService, 'findAll').mockResolvedValue(sessions);

      return expect(controller.findAll(user)).resolves.toStrictEqual(sessions);
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(sessionsService, 'findAll').mockResolvedValue(undefined);

      await expect(controller.findAll({ id: 1 } as User)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne()', () => {
    it('should return session info', async () => {
      const session = {} as Session;

      jest.spyOn(sessionsService, 'findOne').mockResolvedValue(session);

      return expect(controller.findOne('20')).resolves.toBe(session);
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(sessionsService, 'findOne').mockResolvedValue(undefined);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);

      expect(sessionsService.findOne).toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should return created session', async () => {
      const createSessionDto: CreateSessionDto = {
        email: 'lorem@ipsum.dolor',
        password: 'abc',
      };
      const expressSession = {};
      const session = {} as Session;

      jest.spyOn(sessionsService, 'create').mockResolvedValue(session);

      await expect(
        controller.create(createSessionDto, expressSession),
      ).resolves.toBe(session);
    });

    it(`should throw Http exception`, async () => {
      const createSessionDto: CreateSessionDto = {} as CreateSessionDto;
      const expressSession: ExpressSessionDataDto = {} as ExpressSessionDataDto;
      const spy = jest.spyOn(sessionsService, 'create');

      spy.mockRejectedValueOnce(new EmailNotFoundException(''));

      await expect(
        controller.create(createSessionDto, expressSession),
      ).rejects.toThrow(UnauthorizedException);

      spy.mockRejectedValueOnce(new IncorrectPasswordException());

      await expect(
        controller.create(createSessionDto, expressSession),
      ).rejects.toThrow(UnauthorizedException);

      spy.mockRejectedValueOnce(new Error());

      await expect(
        controller.create(createSessionDto, expressSession),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update()', () => {
    it('should return updated session', async () => {
      const updateSessionDto: UpdateSessionDto = {
        data: { cookie: {} } as SessionData,
        userId: 1,
      };
      const session = {} as Session;

      jest.spyOn(sessionsService, 'update').mockResolvedValue(session);

      await expect(controller.update('1', updateSessionDto)).resolves.toBe(
        session,
      );
    });
  });

  describe('remove()', () => {
    it('should return nothing', async () => {
      expect(await controller.remove('1')).toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(sessionsService, 'remove').mockResolvedValue(null);

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
