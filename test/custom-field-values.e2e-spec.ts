import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TYPEORM_MODULE_OPTIONS } from '@nestjs/typeorm/dist/typeorm.constants';
import { AuthGuard } from '../src/auth.guard';
import { CustomFieldValue } from '../src/custom-field-values/entities/custom-field-value.entity';
import { CustomField } from '../src/custom-fields/entities/custom-field.entity';
import * as supertest from 'supertest';
import { Connection, getConnection, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import { UpdateCustomFieldValueDto } from 'src/custom-field-values/dto/update-custom-field-value.dto';

const TABLE_PREFIX = `e2ecustom_field_values_`;

describe(`Custom field values module e2e test`, () => {
  let app: NestExpressApplication,
    agent: supertest.SuperAgentTest,
    authGuard: AuthGuard,
    connection: Connection,
    cfRepo: Repository<CustomField>,
    createdCustomField: CustomField;

  beforeEach(async () => {
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
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    cfRepo = module.get<Repository<CustomField>>(
      getRepositoryToken(CustomField),
    );
    connection = getConnection();

    await connection.query(`DELETE FROM ${TABLE_PREFIX}custom_field`);
    await connection.query(
      `ALTER TABLE ${TABLE_PREFIX}custom_field AUTO_INCREMENT = 1`,
    );
    await connection.query(
      `ALTER TABLE ${TABLE_PREFIX}custom_field_value AUTO_INCREMENT = 1`,
    );

    const customField = new CustomField();

    customField.name = `phase`;
    customField.values = [`development`, `design`].map(v => {
      const cfv = new CustomFieldValue();
      cfv.value = v;
      return cfv;
    });
    createdCustomField = await cfRepo.save(customField);

    app = module.createNestApplication();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  afterEach(() => app.close());

  afterAll(() => connection.close());

  describe(`/custom-field-values`, () => {
    describe(`GET`, () => {
      it(`should 200:{customField:CustomField}`, () => {
        return agent
          .get(`/custom-field-values`)
          .expect(200)
          .expect(res => {
            expect(res.body.customFieldValues).toEqual(
              expect.arrayContaining(
                createdCustomField.values.map(v =>
                  expect.objectContaining<CustomFieldValue>(v),
                ),
              ),
            );
          });
      });

      it(`should 404`, async () => {
        await connection.query(`DELETE FROM ${TABLE_PREFIX}custom_field`);

        return agent.get(`/custom-field-values`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent.get(`/custom-field-values`).expect(403);
      });
    });
  });

  describe(`/custom-field-values/:customFieldId`, () => {
    describe(`GET`, () => {
      it(`should 200:{customField:CustomField}`, () => {
        return agent
          .get(`/custom-field-values/${createdCustomField.values[0].id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.customFieldValue).toEqual(
              expect.objectContaining<CustomFieldValue>(
                createdCustomField.values[0],
              ),
            );
          });
      });

      it(`should 404`, () => {
        return agent.get(`/custom-field-values/123`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent
          .get(`/custom-field-values/${createdCustomField.values[0].id}`)
          .expect(403);
      });
    });

    describe(`PUT`, () => {
      let updateCustomFieldValueDto: UpdateCustomFieldValueDto;

      beforeEach(() => {
        updateCustomFieldValueDto = { value: `development naaaaa` };
      });

      it(`should 200:{updatedCustomField:CustomField}`, () => {
        return agent
          .put(`/custom-field-values/${createdCustomField.values[0].id}`)
          .send(updateCustomFieldValueDto)
          .expect(200)
          .expect(res => {
            expect(res.body.updatedCustomFieldValue).toEqual(
              expect.objectContaining<CustomFieldValue>({
                ...createdCustomField.values[0],
                value: updateCustomFieldValueDto.value,
              }),
            );
          });
      });

      it(`should 400`, () => {
        return agent
          .put(`/custom-field-values/${createdCustomField.values[0].id}`)
          .send({})
          .expect(400);
      });

      it(`should 404`, () => {
        return agent
          .put(`/custom-field-values/123`)
          .send(updateCustomFieldValueDto)
          .expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent
          .put(`/custom-field-values/${createdCustomField.values[0].id}`)
          .send(updateCustomFieldValueDto)
          .expect(403);
      });
    });

    describe(`DELETE`, () => {
      it(`should 204`, () => {
        return agent
          .delete(`/custom-field-values/${createdCustomField.values[0].id}`)
          .expect(204);
      });

      it(`should 404`, () => {
        return agent.delete(`/custom-field-values/123`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent
          .delete(`/custom-field-values/${createdCustomField.values[0].id}`)
          .expect(403);
      });
    });
  });
});
