import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { User } from './user.decorator';

/**
 *
 * @see https://github.com/nestjs/nest/issues/1020
 */
function getParamDecoratorFactory(decorator: () => any) {
  class Test {
    public test(@decorator() value) {
      return value;
    }
  }

  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
  return args[Object.keys(args)[0]].factory;
}

describe(`User() decorator`, () => {
  it('should return user', () => {
    const factory = getParamDecoratorFactory(User);
    const mockUser = {};
    const result = factory(null, {
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => ({ user: mockUser })),
      })),
    });

    expect(result).toBe(mockUser);
  });
});
