import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserAlreadyExistsException } from './exceptions/user-already-exists.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController API Contract', () => {
  let usersController: UsersController, usersService: UsersService, user: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        /**
         * @TODO Should override UsersService instead of mocking its repository
         */
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
    } as User;
  });

  describe('findOne()', () => {
    it('should return a found user', async () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      expect(await usersController.findOne('1')).toStrictEqual({ user });
    });

    it('should throw NotFoundException if user with given id could not be found', () => {
      jest.spyOn(usersService, 'findOne').mockResolvedValue(undefined);

      return expect(usersController.findOne('1')).rejects.toThrow(
        new NotFoundException(),
      );
    });
  });

  describe('create()', () => {
    it('should return the created user', async () => {
      jest.spyOn(usersService, 'create').mockResolvedValue(user);

      expect(await usersController.create({} as CreateUserDto)).toStrictEqual({
        createdUser: user,
      });
    });

    it(`should throw ConflictException`, () => {
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new UserAlreadyExistsException());

      return expect(
        usersController.create({} as CreateUserDto),
      ).rejects.toThrow(ConflictException);
    });

    it(`should throw what is thrown by the servie`, () => {
      const error = new Error();

      jest.spyOn(usersService, 'create').mockRejectedValue(error);

      return expect(
        usersController.create({} as CreateUserDto),
      ).rejects.toThrow(error);
    });
  });

  describe('update()', () => {
    it('should return the updated user', async () => {
      const updatedUser = { id: 1 } as User;

      jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

      expect(await usersController.update('1', user)).toStrictEqual({
        updatedUser,
      });
    });

    it(`should throw NotFoundException`, () => {
      jest
        .spyOn(usersService, 'update')
        .mockRejectedValue(new UserNotFoundException());

      return expect(
        usersController.update('1', {} as UpdateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it(`should throw BadRequestException`, () => {
      const error = new Error();

      error.name = `UpdateValuesMissingError`;

      jest.spyOn(usersService, 'update').mockRejectedValue(error);

      return expect(
        usersController.update('1', {} as UpdateUserDto),
      ).rejects.toThrow(BadRequestException);
    });

    it(`should throw what is thrown by the servie`, () => {
      const error = new Error();

      jest.spyOn(usersService, 'update').mockRejectedValue(error);

      return expect(
        usersController.update('1', {} as UpdateUserDto),
      ).rejects.toThrow(error);
    });
  });

  describe('remove()', () => {
    it('should call usersService.remove()', async () => {
      jest.spyOn(usersService, 'remove').mockResolvedValue(1);

      expect(await usersController.remove('1')).toBeUndefined();
    });

    it('should throw NotFoundException if user with given id could not be found', () => {
      jest
        .spyOn(usersService, 'remove')
        .mockRejectedValue(new UserNotFoundException());

      return expect(usersController.remove('1')).rejects.toThrow(
        new NotFoundException(),
      );
    });

    it(`should throw what is thrown by the servie`, () => {
      const error = new Error();

      jest.spyOn(usersService, 'remove').mockRejectedValue(error);

      return expect(usersController.remove('1')).rejects.toThrow(error);
    });
  });
});
