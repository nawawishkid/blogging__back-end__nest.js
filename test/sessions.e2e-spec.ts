import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

describe(`Session controller`, () => {
  let app: INestApplication,
    agent: request.SuperAgentTest,
    authService: AuthService,
    path: string,
    ur: Repository<User>,
    createdUser: User;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({ authenticate: () => null })
      .compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    ur = moduleFixture.get<Repository<User>>(getRepositoryToken(User));

    await ur.query(`DELETE FROM ${ur.metadata.tableName}`);
    await ur.query(`ALTER TABLE ${ur.metadata.tableName} AUTO_INCREMENT = 1`);
    await ur.query(`DELETE FROM session`);

    const user: CreateUserDto = {
      username: 'nawawishkid',
      email: 'nawawish@samerpark.com',
      password: 'lorem',
    };

    createdUser = await ur.save(user);

    app = moduleFixture.createNestApplication();
    app = await bootstrap(app);

    app.get<Logger>(WINSTON_MODULE_PROVIDER).silent = true;

    await app.init();

    agent = request.agent(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/sessions', () => {
    describe(`POST`, () => {
      path = '/sessions';

      it(`should 201:{createdSession: Session}`, () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        return agent
          .post(path)
          .send({ email: createdUser.email, password: createdUser.password })
          .expect(201)
          .expect(res => {
            expect(res.body.createdSession).toEqual(
              expect.objectContaining({
                id: expect.any(String),
                data: expect.any(String),
                expiresAt: expect.any(String),
                createdAt: expect.any(String),
              }),
            );
            expect(res.body.createdSession.isRevoked).toEqual(false);
            expect(res.body.createdSession.userId).toEqual(createdUser.id);
          });
      });

      it(`should 400`, () => {
        const invalidCreateSessionDto = {};

        return agent
          .post(path)
          .send(invalidCreateSessionDto)
          .expect(400);
      });
    });

    describe('GET', () => {
      path = '/sessions';

      it('should respond with all sessions of the current user', async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        await agent
          .post(path)
          .send({ email: 'some@email.com', password: 'password' });

        return agent
          .get(path)
          .expect(200)
          .expect(res => {
            expect(res.body.sessions).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: expect.any(String),
                  data: expect.any(String),
                  expiresAt: expect.any(String),
                  createdAt: expect.any(String),
                }),
              ]),
            );
          });
      });

      it(`should 403`, () => {
        return agent.get(path).expect(403);
      });
    });
  });
});
