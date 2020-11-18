import { NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';
import { UsersInterceptor } from './users.interceptor';

describe('User interceptor', () => {
  let usersInterceptor: UsersInterceptor,
    context,
    callHandler,
    handlerName,
    controllerReturnedData;
  const intercept = () =>
    new Promise((res, rej) =>
      usersInterceptor.intercept(context, callHandler).subscribe(res, rej),
    );
  const testReturnedObject = (methodName, expectedKey, data) => {
    handlerName = methodName;
    controllerReturnedData = data;

    return expect(intercept()).resolves.toStrictEqual({ [expectedKey]: data });
  };

  beforeEach(() => {
    context = { getHandler: jest.fn(() => ({ name: handlerName })) };
    callHandler = {
      handle: jest.fn(() => of(controllerReturnedData)),
    };
    usersInterceptor = new UsersInterceptor();
  });

  describe('intercept()', () => {
    it(`should return object with 'user' property when the handler of the context is 'findOne'`, () =>
      testReturnedObject('findOne', 'user', { id: 1 }));

    it(`should return object with 'updatedUser' property when the handler of the context is 'update'`, () =>
      testReturnedObject('update', 'updatedUser', { id: 1 }));

    it(`should return object with 'createdUser' property when the handler of the context is 'create'`, () =>
      testReturnedObject('create', 'createdUser', { id: 1 }));
  });
});
