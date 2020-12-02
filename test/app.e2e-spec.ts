import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_MODULE_OPTIONS } from '@nestjs/typeorm/dist/typeorm.constants';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import * as supertest from 'supertest';
import { Connection, getConnection } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { CreateSessionDto } from 'src/sessions/dto/create-session.dto';
import { Session } from 'src/sessions/entities/session.entity';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CreateBlogRequestBodyDto } from 'src/blogs/dto/create-blog-request-body.dto';
import { Blog } from 'src/blogs/entities/blog.entity';
import { UpdateBlogRequestBodyDto } from 'src/blogs/dto/update-blog-request-body.dto';

const TABLE_PREFIX = `appe2e_`;

const post = (
  agent: supertest.SuperAgentTest,
  path: string,
  dto: any,
): supertest.Test => agent.post(path).send(dto);

describe(`Application e2e tests`, () => {
  let app: NestExpressApplication,
    agent: supertest.SuperAgentTest,
    connection: Connection,
    logger: Logger;
  let createUser: (
      dto: CreateUserDto,
      agent?: supertest.SuperAgentTest,
    ) => supertest.Test,
    createSession: (
      dto: CreateSessionDto,
      agent?: supertest.SuperAgentTest,
    ) => supertest.Test,
    createBlog: (
      dto: CreateBlogRequestBodyDto,
      agent?: supertest.SuperAgentTest,
    ) => supertest.Test,
    logout: (sid: string, agent?: supertest.SuperAgentTest) => supertest.Test;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TYPEORM_MODULE_OPTIONS)
      .useFactory({
        inject: [ConfigService],
        factory: (configService: ConfigService): TypeOrmModuleOptions => ({
          type: 'mysql',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          autoLoadEntities: true,
          synchronize: true,
          entityPrefix: TABLE_PREFIX,
          keepConnectionAlive: true,
        }),
      })
      .compile();

    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
    logger.silent = true;
    connection = getConnection();

    await Promise.all(
      connection.entityMetadatas.map(meta =>
        connection.query(`DELETE FROM ${meta.tableName}`),
      ),
    );

    app = module.createNestApplication();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
    createUser = (dto, agent2) => post(agent2 || agent, `/users`, dto);
    createSession = (dto, agent2) => post(agent2 || agent, `/sessions`, dto);
    createBlog = (dto, agent2) => post(agent2 || agent, `/blogs`, dto);
    logout = (sid, agent2) => (agent2 || agent).delete(`/sessions/${sid}`);
  });

  afterEach(() => app.close());

  afterAll(() => connection.close());

  describe(`Scenarios`, () => {
    describe(`Public request`, () => {
      describe(`Create a user -> login -> logout`, () => {
        it(`should create a new user then log the user in and finally log the user out`, async () => {
          // 1. Create a user.
          const createUserDto: CreateUserDto = {
            email: `kid@gmail.com`,
            password: `loremipsum`,
            username: `kid`,
          };
          const createdUser: User = await createUser(createUserDto)
            .expect(201)
            .then(res => res.body.createdUser);

          // 2. Logging in (create a session)
          const createSessionDto: CreateSessionDto = {
            email: createdUser.email,
            password: createUserDto.password,
          };
          const createdSession: Session = await createSession(createSessionDto)
            .expect(201)
            .then(res => res.body.createdSession);

          // 3. Logging out (destroy the session)
          await logout(createdSession.id);
        });
      });
    });

    describe(`Authenticated client`, () => {
      let createUserDto: CreateUserDto,
        createdUser: User,
        createSessionDto: CreateSessionDto,
        createdSession: Session;

      beforeEach(async () => {
        agent = supertest.agent(app.getHttpServer());
        createUserDto = {
          email: `kid@gmail.com`,
          password: `loremipsum`,
          username: `kid`,
        };
        createdUser = await createUser(createUserDto).then(
          res => res.body.createdUser,
        );
        createSessionDto = {
          email: createdUser.email,
          password: createUserDto.password,
        };
        createdSession = await createSession(createSessionDto)
          .expect(201)
          .then(res => res.body.createdSession);
      });

      afterEach(() => logout(createdSession.id));

      describe(`Create a blog -> get all blogs -> get the blog -> update the blog -> remove the blog`, () => {
        it(``, async () => {
          const createBlogDto: CreateBlogRequestBodyDto = {
            title: `Hello, world!`,
          };
          const createdBlog: Blog = await createBlog(createBlogDto)
            .expect(201)
            .then(res => res.body.createdBlog);
          const updateBlogDto: UpdateBlogRequestBodyDto = { title: 'ok' };

          await agent
            .get(`/blogs`)
            .expect(200)
            .expect(res => {
              expect(res.body.blogs.length).toEqual(1);
            });
          await agent.get(`/blogs/${createdBlog.id}`).expect(200);
          await agent
            .put(`/blogs/${createdBlog.id}`)
            .send(updateBlogDto)
            .expect(200)
            .expect(res => {
              expect(res.body.updatedBlog).toStrictEqual({
                ...createdBlog,
                ...updateBlogDto,
                updatedAt: expect.any(String),
              });
            });
          await agent.delete(`/blogs/${createdBlog.id}`).expect(204);
        });
      });

      describe(`Create more sessions -> get all sessions -> remove all other sessions`, () => {
        it(``, async () => {
          const sessionsQty = 10;

          await Promise.all(
            Array(sessionsQty)
              .fill(null)
              .map(() => {
                const newAgent = supertest.agent(app.getHttpServer());

                return createSession(createSessionDto, newAgent).then(
                  res => res.body.createdSession,
                );
              }),
          );

          await agent
            .get(`/sessions`)
            .expect(200)
            .expect(res => {
              expect(res.body.sessions.length).toEqual(sessionsQty + 1);
            });
        });
      });
    });
  });
});