import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController API Contract', () => {
  let usersController: UsersController, usersService: UsersService, user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(() => ({ affected: 1 })),
            delete: jest.fn(() => ({ affected: 1 })),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    user = {
      id: 1,
      email: '',
      emailIsVerified: false,
      firstName: null,
      lastName: null,
      username: 'username',
      password: 'abc',
      createdAt: 'da',
    };
  });

  describe('findOne()', () => {
    it('should call usersService.findOne()', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      expect(await usersController.findOne('1')).toBe(user);
    });

    it('should throw NotFoundException if user with given id could not be found', () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(undefined);

      return expect(usersController.findOne('1')).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('create()', () => {
    it('should call usersService.create()', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      expect(await usersController.create({} as CreateUserDto)).toBe(user);
    });
  });

  describe('update()', () => {
    it('should call usersService.update()', async () => {
      const user = { id: 1 } as User;

      jest.spyOn(usersService, 'update').mockResolvedValue(user);

      expect(await usersController.update('1', user)).toBe(user);
    });
  });

  describe('remove()', () => {
    it('should call usersService.remove()', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(1);

      expect(await usersController.remove('1')).toBeUndefined();
    });

    it('should throw NotFoundException if user with given id could not be found', () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(null);

      return expect(usersController.remove('1')).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });
});
