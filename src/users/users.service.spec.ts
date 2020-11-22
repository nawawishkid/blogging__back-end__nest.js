import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
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
  });
  describe('update()', () => {
    it('should return updated user', async () => {
      const data = { id: 1 } as UpdateUserDto;

      expect(await usersService.update(1, data)).toStrictEqual(data);
      expect(usersRepository.save).toHaveBeenCalled();
    });
  });
  describe('remove()', () => {
    it('should return removed user ID', async () => {
      expect(await usersService.remove(1)).toBe(1);
      expect(usersRepository.delete).toHaveBeenCalled();
    });
  });
});
