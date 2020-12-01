import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import * as supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { bootstrap } from '../src/bootstrap';
import { CreateCustomFieldDto } from '../src/custom-fields/dto/create-custom-field.dto';
import { CustomField } from '../src/custom-fields/entities/custom-field.entity';
import { AuthGuard } from '../src/auth.guard';
import { TYPEORM_MODULE_OPTIONS } from '@nestjs/typeorm/dist/typeorm.constants';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Connection, getConnection } from 'typeorm';
import { CustomFieldValue } from 'src/custom-field-values/entities/custom-field-value.entity';
import { CreateCustomFieldResponseDto } from 'src/custom-fields/dto/response.dto';
import { UpdateCustomFieldDto } from 'src/custom-fields/dto/update-custom-field.dto';
import { CreateCustomFieldValueDto } from 'src/custom-field-values/dto/create-custom-field-value.dto';
import { CreateCustomFieldValueRequestBodyDto } from 'src/custom-fields/dto/create-custom-field-value-request-body.dto';

const TABLE_PREFIX = `e2ecustom_fields_`;

function sendCreateCustomFieldRequest(
  agent: supertest.SuperAgentTest,
  dto: CreateCustomFieldDto,
) {
  return agent.post(`/custom-fields`).send(dto);
}

describe(`Custom fields module e2e test`, () => {
  let app: NestExpressApplication,
    agent: supertest.SuperAgentTest,
    authGuard: AuthGuard,
    connection: Connection;

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
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockResolvedValue(true) })
      .compile();

    authGuard = module.get<AuthGuard>(AuthGuard);
    connection = getConnection();

    await connection.query(`DELETE FROM ${TABLE_PREFIX}custom_field`);
    await connection.query(
      `ALTER TABLE ${TABLE_PREFIX}custom_field AUTO_INCREMENT = 1`,
    );

    app = module.createNestApplication();
    app = await bootstrap(app);

    await app.init();

    agent = supertest.agent(app.getHttpServer());
  });

  afterEach(() => app.close());

  afterAll(() => connection.close());

  describe(`/custom-fields`, () => {
    describe(`POST`, () => {
      it(`should 201:{createdCustomField:CustomField}`, () => {
        const createCustomFieldDto: CreateCustomFieldDto = { name: 'phase' };

        return sendCreateCustomFieldRequest(agent, createCustomFieldDto)
          .expect(201)
          .expect(res => {
            expect(res.body.createdCustomField).toEqual(
              expect.objectContaining<CustomField>({
                id: expect.any(Number),
                name: createCustomFieldDto.name,
                values: [],
                description: null,
              }),
            );
          });
      });

      it(`should 201:{createdCustomField:CustomField}`, () => {
        const createCustomFieldDto: CreateCustomFieldDto = {
          name: 'phase',
          values: ['development', 'design', 'maintenance'],
        };

        return sendCreateCustomFieldRequest(agent, createCustomFieldDto)
          .expect(201)
          .expect(res => {
            expect(res.body.createdCustomField).toEqual(
              expect.objectContaining<CustomField>({
                id: expect.any(Number),
                name: createCustomFieldDto.name,
                values: expect.arrayContaining(
                  createCustomFieldDto.values.map(v =>
                    expect.objectContaining<CustomFieldValue>({
                      id: expect.any(Number),
                      value: v,
                      customFieldId: res.body.createdCustomField.id,
                      description: null,
                    }),
                  ),
                ),
                description: null,
              }),
            );
          });
      });

      it(`should 400`, () => {
        const createCustomFieldDto: CreateCustomFieldDto = {} as CreateCustomFieldDto;

        return sendCreateCustomFieldRequest(agent, createCustomFieldDto).expect(
          400,
        );
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return sendCreateCustomFieldRequest(
          agent,
          {} as CreateCustomFieldDto,
        ).expect(403);
      });
    });

    describe(`GET`, () => {
      it(`should 200:{customFields:CustomField[]}`, async () => {
        const createCustomFieldDto: CreateCustomFieldDto = { name: `phase` };
        const {
          createdCustomField,
        }: CreateCustomFieldResponseDto = await sendCreateCustomFieldRequest(
          agent,
          createCustomFieldDto,
        ).then(res => res.body);

        return agent
          .get(`/custom-fields`)
          .expect(200)
          .expect(res => {
            expect(res.body.customFields).toEqual(
              expect.arrayContaining([
                expect.objectContaining<CustomField>(createdCustomField),
              ]),
            );
          });
      });

      it(`should 404`, () => {
        return agent.get(`/custom-fields`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent.get(`/custom-fields`).expect(403);
      });
    });
  });

  describe(`/custom-fields/:customFieldId`, () => {
    let createdCustomField: CustomField;

    beforeEach(async () => {
      const createCustomFieldDto: CreateCustomFieldDto = { name: `phase` };

      createdCustomField = await sendCreateCustomFieldRequest(
        agent,
        createCustomFieldDto,
      ).then(res => res.body.createdCustomField);
    });

    describe(`GET`, () => {
      it(`should 200:{customField:CustomField}`, () => {
        return agent
          .get(`/custom-fields/${createdCustomField.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.customField).toEqual(
              expect.objectContaining<CustomField>(createdCustomField),
            );
          });
      });

      it(`should 404`, () => {
        return agent.get(`/custom-fields/123`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent.get(`/custom-fields/${createdCustomField.id}`).expect(403);
      });
    });

    describe(`PUT`, () => {
      let updateCustomFieldDto: UpdateCustomFieldDto;

      beforeEach(() => {
        updateCustomFieldDto = { name: `development side` };
      });

      it(`should 200:{updatedCustomField:CustomField}`, () => {
        return agent
          .put(`/custom-fields/${createdCustomField.id}`)
          .send(updateCustomFieldDto)
          .expect(200)
          .expect(res => {
            expect(res.body.updatedCustomField).toEqual(
              expect.objectContaining<CustomField>({
                ...createdCustomField,
                name: updateCustomFieldDto.name,
              }),
            );
          });
      });

      it(`should 400`, () => {
        return agent
          .put(`/custom-fields/123`)
          .send({})
          .expect(400);
      });

      it(`should 404`, () => {
        return agent
          .put(`/custom-fields/123`)
          .send({ name: 'ok' })
          .expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent.put(`/custom-fields/${createdCustomField.id}`).expect(403);
      });
    });

    describe(`DELETE`, () => {
      it(`should 204`, () => {
        return agent
          .delete(`/custom-fields/${createdCustomField.id}`)
          .expect(204);
      });

      it(`should 404`, () => {
        return agent.delete(`/custom-fields/123`).expect(404);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent
          .delete(`/custom-fields/${createdCustomField.id}`)
          .expect(403);
      });
    });
  });

  describe(`/custom-fields/:customFieldId/values`, () => {
    let createdCustomField: CustomField,
      createCustomFieldValueRequestBodyDto: CreateCustomFieldValueRequestBodyDto;

    beforeEach(async () => {
      const createCustomFieldDto: CreateCustomFieldDto = { name: `phase` };

      createdCustomField = await sendCreateCustomFieldRequest(
        agent,
        createCustomFieldDto,
      ).then(res => res.body.createdCustomField);

      createCustomFieldValueRequestBodyDto = { value: `ok` };
    });

    describe(`POST`, () => {
      it(`should {201:{createdCustomFieldValue:CustomFieldValue}}`, () => {
        return agent
          .post(`/custom-fields/${createdCustomField.id}/values`)
          .send(createCustomFieldValueRequestBodyDto)
          .expect(201)
          .expect(res => {
            expect(res.body.createdCustomFieldValue).toEqual(
              expect.objectContaining<CustomFieldValue>({
                id: expect.any(Number),
                value: createCustomFieldValueRequestBodyDto.value,
                description: null,
                customFieldId: createdCustomField.id,
              }),
            );
          });
      });

      it(`should 400`, () => {
        delete createCustomFieldValueRequestBodyDto.value;

        return agent
          .post(`/custom-fields/${createdCustomField.id}/values`)
          .send(createCustomFieldValueRequestBodyDto)
          .expect(400);
      });

      it(`should 403`, () => {
        jest.spyOn(authGuard, 'canActivate').mockResolvedValue(false);

        return agent
          .post(`/custom-fields/${createdCustomField.id}/values`)
          .send(createCustomFieldValueRequestBodyDto)
          .expect(403);
      });
    });
  });
});
