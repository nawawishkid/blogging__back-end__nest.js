import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_MODULE_OPTIONS } from '@nestjs/typeorm/dist/typeorm.constants';
import { AppModule } from '../src/app.module';
import { AuthGuard } from '../src/auth.guard';
import { bootstrap } from '../src/bootstrap';
import * as supertest from 'supertest';
import { resolve } from 'path';
import { getConnection } from 'typeorm';

const TABLE_PREFIX = 'e2efiles_';

function sendCreateFileRequest(
  agent: supertest.SuperAgentTest,
  filePath: string,
): supertest.Test {
  return agent.post(`/files`).attach(`file`, filePath);
}

describe(`Files module e2e tests`, () => {
  let app: NestExpressApplication,
    agent: supertest.SuperAgentTest,
    authGuard: AuthGuard;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
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

    authGuard = module.get<AuthGuard>(AuthGuard);

    app = module.createNestApplication();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  afterEach(() => app.close());

  afterAll(() => getConnection().close());

  describe(`/files`, () => {
    describe(`POST`, () => {
      const filePath = resolve('test/fixtures/ben-awad-twitter-screenshot.png');

      it(`should 201:{createdFile:File}`, () => {
        return sendCreateFileRequest(agent, filePath)
          .expect(201)
          .expect(res => {
            expect(res.body.createdFile).toEqual(
              expect.objectContaining({
                id: expect.any(Number),
                type: expect.any(String),
                size: expect.any(Number),
                path: expect.any(String),
              }),
            );
          });
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockReturnValue(false);

        return sendCreateFileRequest(agent, filePath).expect(403);
      });
    });

    describe(`GET`, () => {
      it(`should 200:{files:File[]}`, () => {
        return;
      });
    });
  });

  describe(`/files/:fileId`, () => {
    describe(`GET`, () => {
      it(`should 200:{file:File}`, () => {
        return;
      });
    });

    describe(`PUT`, () => {
      it(`should 200:{updatedFile:File}`, () => {
        return;
      });
    });

    describe(`DELETE`, () => {
      it(`should 204`, () => {
        return;
      });
    });
  });
});
