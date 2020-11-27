import { ER_DUP_ENTRY } from 'mysql/lib/protocol/constants/errors';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserAlreadyExistsException } from './exceptions/user-already-exists.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let usersService: UsersService, usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(async data => data),
            findOne: jest.fn(async data => data),
            update: jest.fn(() => ({ affected: 1 })),
            delete: jest.fn(() => ({ affected: 1 })),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('findOne()', () => {
    it('should return a user', async () => {
      const data = 1;

      expect(await usersService.findOne(data)).toBe(data);
      expect(usersRepository.findOne).toHaveBeenCalled();
    });
  });
  describe(`findByEmail()`, () => {
    it(`should return a user`, async () => {
      let receivedCondition;
      const email = 'email@gmail.com';
      const select = null;
      const users = { 'a@abc.co': {}, [email]: {} };

      jest
        .spyOn(usersRepository, 'findOne')
        .mockImplementation((condition: any) => {
          receivedCondition = condition;

          return Promise.resolve(users[condition.where.email] as User);
        });

      expect(await usersService.findByEmail(email)).toBe(users[email]);
      expect(receivedCondition).toStrictEqual({ where: { email }, select });
    });
  });
  describe('create()', () => {
    it('should return created user', async () => {
      const data = { email: 'haha' } as CreateUserDto;

      expect(await usersService.create(data)).toStrictEqual(data);
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it(`should throw UserAlreadyExistsException`, () => {
      const createUserDto: CreateUserDto = {
        email: 'kid@mail.com',
        password: 'password',
        username: 'nawawishkid',
      };
      const error: any = new QueryFailedError('query', [], {});

      error.errno = ER_DUP_ENTRY;

      jest.spyOn(usersRepository, 'save').mockRejectedValue(error);

      return expect(usersService.create(createUserDto)).rejects.toThrow(
        UserAlreadyExistsException,
      );
    });

    it(`should throw what the repo throws`, () => {
      const error = new QueryFailedError('something', [], {});

      jest.spyOn(usersRepository, 'save').mockRejectedValue(error);

      return expect(usersService.create({} as CreateUserDto)).rejects.toThrow(
        error,
      );
    });
  });
  describe('update()', () => {
    it('should return updated user', async () => {
      const data = { id: 1 } as UpdateUserDto;
      const updatedUser = {} as User;

      jest.spyOn(usersRepository, 'findOne').mockResolvedValue(updatedUser);

      expect(await usersService.update(1, data)).toStrictEqual(updatedUser);
      expect(usersRepository.update).toHaveBeenCalled();
      expect(usersRepository.findOne).toHaveBeenCalled();
    });

    it(`should throw UserNotFoundException`, () => {
      jest
        .spyOn(usersRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(
        usersService.update(10, {} as UpdateUserDto),
      ).rejects.toThrow(UserNotFoundException);
    });
  });
  describe('remove()', () => {
    it('should return removed user ID', async () => {
      expect(await usersService.remove(1)).toBe(1);
      expect(usersRepository.delete).toHaveBeenCalled();
    });

    it(`should throw UserNotFoundException`, () => {
      jest
        .spyOn(usersRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(usersService.remove(10)).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});
