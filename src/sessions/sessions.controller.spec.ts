import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../users/entities/user.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
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

      await controller.findAll(user);

      expect(sessionsService.findAll).toHaveBeenCalled();
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(sessionsService, 'findAll').mockResolvedValue(undefined);

      await expect(controller.findAll({ id: 1 } as User)).rejects.toThrow(
        NotFoundException,
      );
      expect(sessionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should return session info', async () => {
      await controller.findOne('20');

      expect(sessionsService.findOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(sessionsService, 'findOne').mockResolvedValue(undefined);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);

      expect(sessionsService.findOne).toHaveBeenCalled();
    });
  });

  describe('create()', () => {
    it('should return created session', async () => {
      const session: CreateSessionDto = {
        email: 'lorem@ipsum.dolor',
      } as CreateSessionDto;

      jest.spyOn(sessionsService, 'create').mockResolvedValue(session as any);

      await expect(controller.create(session, {})).resolves.toBe(session);
      expect(sessionsService.create).toHaveBeenCalled();
    });
  });

  describe('update()', () => {
    it('should return updated session', async () => {
      const session: UpdateSessionDto = {
        data: { cookie: { _expires: 1 } },
        userId: 1,
      };

      jest.spyOn(sessionsService, 'update').mockResolvedValue(session as any);

      await expect(controller.update('1', session)).resolves.toBe(session);
      expect(sessionsService.update).toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should return nothing', async () => {
      expect(await controller.remove('1')).toBeUndefined();
      expect(sessionsService.remove).toHaveBeenCalled();
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(sessionsService, 'remove').mockResolvedValue(null);

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
      expect(sessionsService.remove).toHaveBeenCalled();
    });
  });
});
