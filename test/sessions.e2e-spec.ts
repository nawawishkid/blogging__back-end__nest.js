import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import { CreateSessionDto } from '../src/sessions/dto/create-session.dto';
import { Session } from '../src/sessions/entities/session.entity';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/users/entities/user.entity';

describe(`Session controller`, () => {
  let app: INestApplication,
    agent: request.SuperAgentTest,
    authService: AuthService,
    path: string;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({ authenticate: () => null })
      .compile();

    authService = moduleFixture.get<AuthService>(AuthService);

    app = moduleFixture.createNestApplication();
    app = await bootstrap(app);

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
        const createSessionDto: CreateSessionDto = {
          email: `abc@gmail.com`,
          password: `123`,
        };
        const user: User = { id: 1 } as User;

        jest.spyOn(authService, 'authenticate').mockResolvedValue(user);

        return agent
          .post(path)
          .send(createSessionDto)
          .expect(201)
          .expect(res => {
            const { createdSession } = res.body;

            expect(createdSession).toMatchObject(Session);
            expect(createdSession.id).toEqual(1);
            expect(createdSession.isRevoked).toEqual(false);
            expect(createdSession.userId).toEqual(user.id);
          });
      });

      // it(`should 400`, () => {
      //   const invalidCreateSessionDto = {};

      //   return agent
      //     .post(path)
      //     .send(invalidCreateSessionDto)
      //     .expect(400);
      // });
    });

    // describe('GET', () => {
    //   it('should respond with all sessions of the current user', async () => {
    //     return agent.get(path);
    //   });
    // });
  });
});
