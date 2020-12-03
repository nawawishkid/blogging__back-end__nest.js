import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_MODULE_OPTIONS } from '@nestjs/typeorm/dist/typeorm.constants';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth.guard';
import { Blog } from '../src/blogs/entities/blog.entity';
import { bootstrap } from '../src/bootstrap';
import { User } from '../src/users/entities/user.entity';
import * as supertest from 'supertest';
import { Connection, getConnection, Repository } from 'typeorm';
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
    authGuard: AuthGuard,
    connection: Connection;

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

    connection = getConnection();

    await connection.query(`DELETE FROM ${TABLE_PREFIX}blog`);
    await connection.query(`DELETE FROM ${TABLE_PREFIX}user`);
    await connection.query(
      `ALTER TABLE ${TABLE_PREFIX}user AUTO_INCREMENT = 1`,
    );

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

  afterAll(() => connection.close());

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
            expect(res.body.createdBlog).toEqual<Blog>({
              id: expect.any(String),
              coverImage: null,
              body: null,
              excerpt: null,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              metadata: null,
              blogCustomFields: [],
              author: expect.any(Object),
              ...createBlogDto,
            });
          });
      });

      describe(`with custom fields`, () => {
        const customFieldTableName = TABLE_PREFIX + 'custom_field';
        const customFieldValueTableName = TABLE_PREFIX + 'custom_field_value';

        beforeEach(async () => {
          await connection.query(`DELETE FROM ${customFieldTableName}`);
          await connection.query(`DELETE FROM ${customFieldValueTableName}`);
          await connection.query(
            `ALTER TABLE ${customFieldTableName} AUTO_INCREMENT = 1`,
          );
          await connection.query(
            `ALTER TABLE ${customFieldValueTableName} AUTO_INCREMENT = 1`,
          );

          await connection.query(
            `INSERT INTO ${customFieldTableName} (name) VALUES ('phase')`,
          );
          await connection.query(
            `INSERT INTO ${customFieldValueTableName} (value, customFieldId) VALUES ('design', 1), ('development', 1)`,
          );
        });

        it(`should 201:{createdBlog:Blog}`, async () => {
          createBlogDto.customFieldValueIds = [1, 2];

          return sendCreateBlogRequest(agent, createBlogDto)
            .expect(201)
            .expect(res => {
              expect(res.body.createdBlog).toEqual<Blog>({
                id: expect.any(String),
                coverImage: null,
                body: null,
                excerpt: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                metadata: null,
                /**
                 * @TODO Make it return { ...customFieldEntity, value: CustomFieldValue }
                 */
                blogCustomFields: [
                  { blogId: res.body.createdBlog.id, customFieldValueId: 1 },
                  { blogId: res.body.createdBlog.id, customFieldValueId: 2 },
                ],
                author: expect.any(Object),
                title: createBlogDto.title,
              });
            });
        });

        it(`should 409 on giving duplicated custom field value ids`, async () => {
          createBlogDto.customFieldValueIds = [1, 2, 1];

          await sendCreateBlogRequest(agent, createBlogDto).expect(409);
        });

        it(`should 400 on giving at least one unknown custom field value id`, async () => {
          createBlogDto.customFieldValueIds = [1, 2, 1000];

          await sendCreateBlogRequest(agent, createBlogDto).expect(400);
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

    describe(`GET`, () => {
      it(`should 200:{blog:Blog}`, () => {
        return agent
          .get(`/blogs/${createdBlog.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.blog).toEqual(
              expect.objectContaining({
                id: createdBlog.id,
                coverImage: null,
                body: null,
                excerpt: null,
                createdAt: createdBlog.createdAt,
                updatedAt: createdBlog.updatedAt,
                metadata: null,
                ...createdBlog,
              }),
            );
          });
      });

      it(`should 404`, () => {
        return agent.get(`/blogs/lorem`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return agent.get(`/blogs/${createdBlog.id}`).expect(403);
      });
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

      describe(`with custom fields`, () => {
        const customFieldTableName = TABLE_PREFIX + 'custom_field';
        const customFieldValueTableName = TABLE_PREFIX + 'custom_field_value';

        beforeEach(async () => {
          await connection.query(`DELETE FROM ${customFieldTableName}`);
          await connection.query(`DELETE FROM ${customFieldValueTableName}`);
          await connection.query(
            `ALTER TABLE ${customFieldTableName} AUTO_INCREMENT = 1`,
          );
          await connection.query(
            `ALTER TABLE ${customFieldValueTableName} AUTO_INCREMENT = 1`,
          );

          await connection.query(
            `INSERT INTO ${customFieldTableName} (name) VALUES ('phase')`,
          );
          await connection.query(
            `INSERT INTO ${customFieldValueTableName} (value, customFieldId) VALUES ('design', 1), ('development', 1)`,
          );
        });

        it(`should 201:{updatedBlog:Blog}`, async () => {
          updateBlogDto.customFieldValueIds = [1, 2];

          return agent
            .put(`/blogs/${createdBlog.id}`)
            .send(updateBlogDto)
            .expect(200)
            .expect(res => {
              expect(res.body.updatedBlog).toEqual<Blog>({
                id: expect.any(String),
                coverImage: null,
                body: null,
                excerpt: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
                metadata: null,
                /**
                 * @TODO Make it return { ...customFieldEntity, value: CustomFieldValue }
                 */
                blogCustomFields: [
                  { blogId: res.body.updatedBlog.id, customFieldValueId: 1 },
                  { blogId: res.body.updatedBlog.id, customFieldValueId: 2 },
                ],
                author: expect.any(Object),
                title: updateBlogDto.title,
              });
            });
        });

        it(`should 409 on giving duplicated custom field value ids`, async () => {
          updateBlogDto.customFieldValueIds = [1, 2, 1];

          await agent
            .put(`/blogs/${createdBlog.id}`)
            .send(updateBlogDto)
            .expect(409);
        });

        it(`should 400 on giving at least one unknown custom field value id`, async () => {
          updateBlogDto.customFieldValueIds = [1, 2, 1000];

          await agent
            .put(`/blogs/${createdBlog.id}`)
            .send(updateBlogDto)
            .expect(400);
        });
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
