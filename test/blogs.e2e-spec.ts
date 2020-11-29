import { INestApplication } from '@nestjs/common';
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

const TABLE_PREFIX = 'e2eblog_';

function sendCreateBlogRequest(
  agent: supertest.SuperAgentTest,
  dto: CreateBlogRequestBodyDto,
) {
  return agent.post(`/blogs`).send(dto);
}

describe(`Blogs controller`, () => {
  let app: INestApplication,
    agent: supertest.SuperAgentTest,
    ur: Repository<User>,
    br: Repository<Blog>,
    user: User,
    logger: Logger;

  beforeEach(async () => {
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
        }),
      })
      .compile();

    // const torm = module.get<TypeOrmModuleOptions>(TYPEORM_MODULE_OPTIONS)
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
    logger.silent = true;
    ur = module.get<Repository<User>>(getRepositoryToken(User));
    br = module.get<Repository<Blog>>(getRepositoryToken(Blog));

    await br.query(`DELETE FROM ${br.metadata.tableName}`);
    await ur.query(`DELETE FROM ${ur.metadata.tableName}`);

    user = await ur.save({
      email: `email@gmail.com`,
      password: `password`,
      username: `username`,
    });
    app = await module.createNestApplication();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  afterEach(async () => {
    const conn = getConnection();

    await conn.query(
      `DROP TABLE ${TABLE_PREFIX}blog, ${TABLE_PREFIX}session, ${TABLE_PREFIX}user`,
    );
    await app.close();
  });

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

      it(`should...`, () => {
        return sendCreateBlogRequest(agent, createBlogDto).expect(201);
      });
    });
  });
});
