import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import supertest, * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateSessionResponseDto } from 'src/sessions/dto/response.dto';
import { UpdateSessionDto } from 'src/sessions/dto/update-session.dto';

const sendCreateSessionRequest = (
  agent: supertest.SuperAgentTest,
): supertest.Test =>
  agent
    .post(`/sessions`)
    .send({ email: 'some@email.com', password: 'password' });

describe(`Session controller`, () => {
  let app: INestApplication,
    agent: request.SuperAgentTest,
    authService: AuthService,
    ur: Repository<User>,
    createdUser: User,
    logger: Logger;

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
    logger = app.get<Logger>(WINSTON_MODULE_PROVIDER);
    logger.silent = true;

    await app.init();

    agent = request.agent(app.getHttpServer());
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/sessions', () => {
    describe(`POST`, () => {
      it(`should 201:{createdSession: Session}`, () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        return agent
          .post('/sessions')
          .send({ email: createdUser.email, password: createdUser.password })
          .expect(201)
          .expect(res => {
            expect(res.body.createdSession).toEqual(
              expect.objectContaining({
                id: expect.any(String),
                data: expect.any(String),
                expiresAt: expect.any(String),
                createdAt: expect.any(String),
                isRevoked: false,
                userId: createdUser.id,
              }),
            );
          });
      });

      it(`should 400`, () => {
        const invalidCreateSessionDto = {};

        return agent
          .post('/sessions')
          .send(invalidCreateSessionDto)
          .expect(400);
      });
    });

    describe('GET', () => {
      it('should respond with all sessions of the current user', async () => {
        const agent2: supertest.SuperAgentTest = request.agent(
          app.getHttpServer(),
        );

        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        await sendCreateSessionRequest(agent);
        await sendCreateSessionRequest(agent2);

        return agent
          .get('/sessions')
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
            expect(res.body.sessions.length).toEqual(2);
          });
      });

      it(`should 403`, () => {
        return agent.get('/sessions').expect(403);
      });
    });
  });

  describe(`/sessions/:sessionId`, () => {
    describe(`GET`, () => {
      it(`should 200:{session:Session}`, async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        const {
          createdSession,
        }: CreateSessionResponseDto = await sendCreateSessionRequest(
          agent,
        ).then(res => res.body);

        return agent
          .get(`/sessions/${createdSession.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.session).toEqual(
              expect.objectContaining({
                id: expect.any(String),
                data: expect.any(String),
                expiresAt: expect.any(String),
                createdAt: expect.any(String),
                isRevoked: false,
                userId: createdUser.id,
              }),
            );
          });
      });

      it(`should 403`, () => {
        return agent.get('/sessions/abc').expect(403);
      });

      it(`should 404`, async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        await sendCreateSessionRequest(agent);

        return agent.get('/sessions/abc').expect(404);
      });
    });

    describe(`PUT`, () => {
      it(`should 200:{updatedSession:Session}`, async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        const {
          createdSession,
        }: CreateSessionResponseDto = await sendCreateSessionRequest(
          agent,
        ).then(res => res.body);
        const updateSessionDto: UpdateSessionDto = { isRevoked: true };

        return agent
          .put(`/sessions/${createdSession.id}`)
          .send(updateSessionDto)
          .expect(200)
          .expect(res => {
            expect(res.body.updatedSession).toEqual(
              expect.objectContaining({
                id: createdSession.id,
                data: expect.any(String),
                isRevoked: true,
                userId: createdUser.id,
              }),
            );
          });
      });

      it(`should 400`, async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        const {
          createdSession,
        }: CreateSessionResponseDto = await sendCreateSessionRequest(
          agent,
        ).then(res => res.body);

        return agent
          .put(`/sessions/${createdSession.id}`)
          .send({ data: {} })
          .expect(400);
      });

      it(`should 403`, () => {
        return agent.put('/sessions/abc').expect(403);
      });
    });

    describe(`DELETE`, () => {
      it(`should 204`, async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        const {
          createdSession,
        }: CreateSessionResponseDto = await sendCreateSessionRequest(
          agent,
        ).then(res => res.body);

        return agent.delete(`/sessions/${createdSession.id}`).expect(204);
      });

      it(`should 404`, async () => {
        jest.spyOn(authService, 'authenticate').mockResolvedValue(createdUser);

        await sendCreateSessionRequest(agent);

        return agent.delete(`/sessions/some-id`).expect(404);
      });

      it(`should 403`, () => {
        return agent.delete(`/sessions/some-id`).expect(403);
      });
    });
  });
});
