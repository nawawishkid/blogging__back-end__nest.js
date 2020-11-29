import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_MODULE_OPTIONS } from '@nestjs/typeorm/dist/typeorm.constants';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth.guard';
import { Blog } from '../src/blogs/entities/blog.entity';
import { bootstrap } from '../src/bootstrap';
import { User } from '../src/users/entities/user.entity';
import * as supertest from 'supertest';
import { getConnection, Repository } from 'typeorm';
import { CreateBlogRequestBodyDto } from '../src/blogs/dto/create-blog-request-body.dto';
import { UserMiddleware } from '../src/users/user.middleware';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { CreateBlogResponseDto } from 'src/blogs/dto/response.dto';
import { UpdateBlogDto } from 'src/blogs/dto/update-blog.dto';

const TABLE_PREFIX = 'e2eblog_';

function sendCreateBlogRequest(
  agent: supertest.SuperAgentTest,
  dto: CreateBlogRequestBodyDto,
) {
  return agent.post(`/blogs`).send(dto);
}

describe(`Blogs controller`, () => {
  let app: NestExpressApplication,
    agent: supertest.SuperAgentTest,
    ur: Repository<User>,
    user: User,
    logger: Logger,
    authGuard: AuthGuard;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideProvider(UserMiddleware)
      .useValue({
        use: jest.fn().mockImplementation((req, res, next) => {
          req.user = user;

          next();
        }),
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

    // const torm = module.get<TypeOrmModuleOptions>(TYPEORM_MODULE_OPTIONS)
    authGuard = module.get<AuthGuard>(AuthGuard);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
    logger.silent = true;
    ur = module.get<Repository<User>>(getRepositoryToken(User));

    const conn = getConnection();

    await conn.query(`DELETE FROM ${TABLE_PREFIX}blog`);
    await conn.query(`DELETE FROM ${TABLE_PREFIX}user`);

    user = await ur.save({
      email: `email@gmail.com`,
      password: `password`,
      username: `username`,
    });
    app = await module.createNestApplication<NestExpressApplication>();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  afterEach(() => app.close());

  afterAll(() => getConnection().close());

  describe(`/blogs`, () => {
    describe(`POST`, () => {
      let createBlogDto: CreateBlogRequestBodyDto;

      beforeEach(() => {
        createBlogDto = { title: `My first blog` };
      });

      it(`should 201:{createdBlog:Blog}`, () => {
        return sendCreateBlogRequest(agent, createBlogDto)
          .expect(201)
          .expect(res => {
            expect(res.body.createdBlog).toEqual(
              expect.objectContaining({
                id: expect.any(String),
                coverImage: null,
                body: null,
                excerpt: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                metadata: null,
                ...createBlogDto,
              }),
            );
          });
      });

      it(`should 400`, () => {
        createBlogDto.title = null;

        return sendCreateBlogRequest(agent, createBlogDto).expect(400);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return sendCreateBlogRequest(agent, createBlogDto).expect(403);
      });
    });

    describe(`GET`, () => {
      it(`should 200:{blogs:Blog[]}`, async () => {
        const createBlogDto: CreateBlogRequestBodyDto = {
          title: `Hello world!`,
        };
        const {
          createdBlog,
        }: CreateBlogResponseDto = await sendCreateBlogRequest(
          agent,
          createBlogDto,
        ).then(res => res.body);

        return agent
          .get(`/blogs`)
          .expect(200)
          .expect(res => {
            expect(res.body.blogs).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  id: createdBlog.id,
                  coverImage: null,
                  body: null,
                  excerpt: null,
                  createdAt: createdBlog.createdAt,
                  updatedAt: createdBlog.updatedAt,
                  metadata: null,
                  ...createBlogDto,
                }),
              ]),
            );
          });
      });

      it(`should 404`, () => {
        return agent.get(`/blogs`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return agent.get(`/blogs`).expect(403);
      });
    });
  });

  describe(`/blogs/:blodId`, () => {
    let createdBlog: Blog;

    beforeEach(async () => {
      createdBlog = await sendCreateBlogRequest(agent, {
        title: 'Hello world',
      }).then(res => res.body.createdBlog);
    });

    describe(`PUT`, () => {
      let updateBlogDto: UpdateBlogDto;

      beforeEach(() => {
        updateBlogDto = { title: 'updated title ' };
      });

      it(`should 200:{updatedBlog:Blog}`, () => {
        return agent
          .put(`/blogs/${createdBlog.id}`)
          .send(updateBlogDto)
          .expect(200)
          .expect(res => {
            expect(res.body.updatedBlog).toEqual(
              expect.objectContaining({
                id: createdBlog.id,
                coverImage: null,
                body: null,
                excerpt: null,
                updatedAt: expect.any(String),
                metadata: null,
                ...updateBlogDto,
              }),
            );
          });
      });

      it(`should 404`, () => {
        return agent
          .put(`/blogs/lorem`)
          .send(updateBlogDto)
          .expect(404);
      });

      it(`should 400`, () => {
        (updateBlogDto as any).lorem = 'hahah';

        return agent
          .put(`/blogs/${createdBlog.id}`)
          .send(updateBlogDto)
          .expect(400);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return agent
          .put(`/blogs/${createdBlog.id}`)
          .send(updateBlogDto)
          .expect(403);
      });
    });

    describe(`DELETE`, () => {
      it(`should 204`, () => {
        return agent.delete(`/blogs/${createdBlog.id}`).expect(204);
      });

      it(`should 404`, () => {
        return agent.delete(`/blogs/hello`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return agent.delete(`/blogs/${createdBlog.id}`).expect(403);
      });
    });
  });
});
