import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { UsersService } from './../src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

describe('AppController (e2e)', () => {
  let app: INestApplication,
    usersService = {
      create: () => 'ok',
      findOne: () => 'ok',
      update: () => 'ok',
      remove: () => 'ok',
    };

  beforeEach(async () => {
    jest.restoreAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersService)
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    await app.init();
  });

  afterEach(async () => {
    /**
     * To solve "Jest did not exit one second after the test run has completed."
     */
    await app.close();
  });

  describe('/users', () => {
    describe('POST', () => {
      it('should respond with 400 if request with incorrect user data on creating a new user', () => {
        return request(app.getHttpServer())
          .post('/users')
          .send({ id: 1 })
          .expect('Content-Type', /json/)
          .expect(400);
      });

      it('should respond with created user data', () => {
        const user: CreateUserDto = {
          email: 'a@a.com',
          password: 'lorem',
          username: 'name',
        };

        return request(app.getHttpServer())
          .post('/users')
          .send(user)
          .expect(201, { createdUser: usersService.create() });
      });
    });
  });

  describe('/users/:userId', () => {
    describe('GET', () => {
      it('should respond with user data', () => {
        return request(app.getHttpServer())
          .get('/users/1')
          .expect(200, { user: usersService.findOne() });
      });

      it('should respond with 404 NotFound if user with given id could not be found', () => {
        jest.spyOn(usersService, 'findOne').mockImplementation(() => undefined);

        return request(app.getHttpServer())
          .get('/users/1')
          .expect(404, new NotFoundException().getResponse());
      });
    });

    describe('PUT', () => {
      it('should respond with updated user', () => {
        const user: UpdateUserDto = { firstName: 'kid' };

        return request(app.getHttpServer())
          .put('/users/1')
          .send(user)
          .expect(200, { updatedUser: usersService.update() });
      });
    });

    describe('DELETE', () => {
      it('should respond with 204 if succesfully remove a user', () => {
        return request(app.getHttpServer())
          .delete('/users/1')
          .expect(204);
      });

      it('should respond with 404 if user with the given id could not be found', () => {
        const notFound = new NotFoundException();

        jest.spyOn(usersService, 'remove').mockImplementation(() => null);

        return request(app.getHttpServer())
          .delete('/users/1')
          .expect(notFound.getStatus(), notFound.getResponse());
      });
    });
  });
});
