import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import * as supertest from 'supertest';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UpdateUserDto } from '../src/users/dto/update-user.dto';
import { AuthGuard } from '../src/auth.guard';
import { NestExpressApplication } from '@nestjs/platform-express';

function sendCreateUserRequest(
  agent: supertest.SuperAgentTest,
  dto: CreateUserDto,
): supertest.Test {
  return agent.post(`/users`).send(dto);
}

function sendUpdateUserRequest(
  agent: supertest.SuperAgentTest,
  userId: number,
  dto,
): supertest.Test {
  return agent.put(`/users/${userId}`).send(dto);
}

describe(`Users e2e`, () => {
  let app: NestExpressApplication,
    agent: supertest.SuperAgentTest,
    logger: Logger,
    ur: Repository<User>,
    authGuard: AuthGuard;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    ur = module.get<Repository<User>>(getRepositoryToken(User));
    authGuard = module.get<AuthGuard>(AuthGuard);

    ur.query(`DELETE FROM ${ur.metadata.tableName}`);
    ur.query(`ALTER TABLE ${ur.metadata.tableName} AUTO_INCREMENT = 1`);

    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
    logger.silent = true;
    app = module.createNestApplication();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  afterEach(() => app.close());

  describe(`/users`, () => {
    describe(`POST`, () => {
      let createUserDto: CreateUserDto;

      beforeEach(() => {
        createUserDto = {
          email: 'lorem@ipsum.com',
          password: 'password',
          username: 'username',
        };
      });

      it(`should 201:{createdUser:User}`, () => {
        return sendCreateUserRequest(agent, createUserDto)
          .expect(201)
          .expect(res => {
            expect(res.body.createdUser).toEqual(
              expect.objectContaining({
                id: expect.any(Number),
                createdAt: expect.any(String),
                emailIsVerified: false,
                firstName: null,
                lastName: null,
                email: createUserDto.email,
                username: createUserDto.username,
              }),
            );
            expect(res.body.createdUser.password).toBeUndefined();
          });
      });

      it(`should 400`, () => {
        delete createUserDto.email;

        return sendCreateUserRequest(agent, createUserDto).expect(400);
      });

      it(`should 400`, () => {
        createUserDto.email = 'someInvalidEmail';

        return sendCreateUserRequest(agent, createUserDto).expect(400);
      });

      it(`should 400`, () => {
        delete createUserDto.username;

        return sendCreateUserRequest(agent, createUserDto).expect(400);
      });

      it(`should 400`, () => {
        delete createUserDto.password;

        return sendCreateUserRequest(agent, createUserDto).expect(400);
      });

      it(`should 400`, () => {
        createUserDto.firstName = 10120120 as any;

        return sendCreateUserRequest(agent, createUserDto).expect(400);
      });
    });
  });

  describe(`/users/:userId`, () => {
    let createdUser: User,
      createUserDto: CreateUserDto,
      updateUserDto: UpdateUserDto;

    beforeEach(async () => {
      createUserDto = {
        email: 'lorem@ipsum.com',
        password: 'password',
        username: 'username',
      };
      updateUserDto = { firstName: 'ok' };
      createdUser = await sendCreateUserRequest(agent, createUserDto).then(
        res => res.body.createdUser,
      );
    });

    describe(`PUT`, () => {
      it(`should 200:{updatedUser:User}`, () => {
        return agent
          .put(`/users/${createdUser.id}`)
          .send(updateUserDto)
          .expect(200)
          .expect(res => {
            expect(res.body.updatedUser).toEqual(
              expect.objectContaining({
                id: createdUser.id,
                firstName: updateUserDto.firstName,
                createdAt: expect.any(String),
                emailIsVerified: false,
                email: createdUser.email,
                username: createdUser.username,
                lastName: null,
              }),
            );
            expect(res.body.updatedUser.password).toBeUndefined();
          });
      });

      it(`should 400 when updateDto is an empty object`, () => {
        return sendUpdateUserRequest(agent, createdUser.id, {}).expect(400);
      });

      it(`should 400`, () => {
        updateUserDto.firstName = 55555 as any;

        return sendUpdateUserRequest(agent, createdUser.id, updateUserDto);
      });

      it(`should 400 when updateDto has an unknown field`, () => {
        (updateUserDto as any).email = 'test@test.com';

        return sendUpdateUserRequest(
          agent,
          createdUser.id,
          updateUserDto,
        ).expect(400);
      });

      it(`should 404`, () => {
        return sendUpdateUserRequest(agent, 123, { firstName: 'ok' }).expect(
          404,
        );
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return sendUpdateUserRequest(agent, createdUser.id, {}).expect(403);
      });
    });

    describe(`DELETE`, () => {
      it(`should 204`, () => {
        return agent.delete(`/users/${createdUser.id}`).expect(204);
      });

      it(`should 404`, () => {
        return agent.delete(`/users/1234`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return agent.delete(`/users/${createdUser.id}`).expect(403);
      });
    });
  });
});
