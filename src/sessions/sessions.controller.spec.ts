import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  CreateSessionResponseDto,
  FindAllSessionsResponseDto,
  FindOneSessionResponseDto,
} from './dto/response.dto';
import {
  ExpressSessionDataDto,
  UpdateSessionDto,
} from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { EmailNotFoundException } from './exceptions/email-not-found.exception';
import { IncorrectPasswordException } from './exceptions/incorrect-password.exception';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';

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
      const body: FindAllSessionsResponseDto = { sessions };

      jest.spyOn(sessionsService, 'findAll').mockResolvedValue(sessions);

      return expect(controller.findAll(user)).resolves.toStrictEqual(body);
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
      const body: FindOneSessionResponseDto = { session };

      jest.spyOn(sessionsService, 'findOne').mockResolvedValue(session);

      return expect(controller.findOne('20')).resolves.toStrictEqual(body);
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
      const createdSession = {} as Session;
      const body: CreateSessionResponseDto = { createdSession };

      jest.spyOn(sessionsService, 'create').mockResolvedValue(createdSession);

      await expect(
        controller.create(createSessionDto, expressSession),
      ).resolves.toStrictEqual(body);
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
      const sid = 'hahaha';
      const user = { id: 1 } as User;
      const expressSessionDataDto = ({
        aloha: 'ok',
      } as unknown) as ExpressSessionDataDto;
      const updateSessionDto: UpdateSessionDto = {
        isRevoked: true,
      };

      jest
        .spyOn(sessionsService, 'update')
        .mockImplementation((sid, session, updateDto) => {
          return Promise.resolve({
            id: sid,
            data: JSON.stringify(session),
            ...updateDto,
          } as any);
        });

      expect(
        await controller.update(
          sid,
          user,
          expressSessionDataDto,
          updateSessionDto,
        ),
      ).toStrictEqual({
        updatedSession: {
          id: sid,
          data: JSON.stringify(expressSessionDataDto),
          isRevoked: updateSessionDto.isRevoked,
          userId: user.id,
        },
      });

      updateSessionDto.userId = 1000;

      expect(
        await controller.update(
          sid,
          user,
          expressSessionDataDto,
          updateSessionDto,
        ),
      ).toStrictEqual({
        updatedSession: {
          id: sid,
          data: JSON.stringify(expressSessionDataDto),
          isRevoked: updateSessionDto.isRevoked,
          userId: updateSessionDto.userId,
        },
      });
    });

    it(`should throw NotFoundException`, () => {
      jest
        .spyOn(sessionsService, 'update')
        .mockRejectedValue(new SessionNotFoundException());

      return expect(
        controller.update(
          '1',
          {} as User,
          {} as ExpressSessionDataDto,
          {} as UpdateSessionDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it(`should throw what is thrown by the service`, () => {
      const error = new Error();

      jest.spyOn(sessionsService, 'update').mockRejectedValue(error);

      return expect(
        controller.update(
          '1',
          {} as User,
          {} as ExpressSessionDataDto,
          {} as UpdateSessionDto,
        ),
      ).rejects.toThrow(error);
    });
  });

  describe('remove()', () => {
    it('should return nothing', async () => {
      expect(await controller.remove('1')).toBeUndefined();
    });

    it('should throw NotFoundException', async () => {
      jest
        .spyOn(sessionsService, 'remove')
        .mockRejectedValue(new SessionNotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw what is thrown by the service', async () => {
      const error = new Error();

      jest.spyOn(sessionsService, 'remove').mockRejectedValue(error);

      await expect(controller.remove('1')).rejects.toThrow(error);
    });
  });
});
