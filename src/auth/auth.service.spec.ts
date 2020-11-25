import { createLogger, transports } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailNotFoundException } from '../sessions/exceptions/email-not-found.exception';
import { IncorrectPasswordException } from '../sessions/exceptions/incorrect-password.exception';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService, usersService: UsersService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: createLogger({
            transports: [new transports.Console({ silent: true })],
          }),
        },
      ],
    })
      .overrideProvider(UsersService)
      .useValue({ findByEmail: jest.fn() })
      .compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`authenticate()`, () => {
    it(`should return authenticated user`, async () => {
      const email = 'abc@abc.com',
        password = '123';

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue({ id: 1, email, password } as User);
      mockedBcrypt.compare.mockResolvedValue(true);

      await service.authenticate(email, password);
    });

    it(`should throw EmailNotFoundException when unknown email given`, async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(undefined);

      await expect(
        service.authenticate('123@gmail.com', 'abc'),
      ).rejects.toThrow(EmailNotFoundException);
    });

    it(`should throw IncorrectPasswordException`, async () => {
      const user = { id: 1, email: '123@gmail.com', password: '123' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as User);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(service.authenticate(user.email, 'abc')).rejects.toThrow(
        IncorrectPasswordException,
      );
    });
  });
});
