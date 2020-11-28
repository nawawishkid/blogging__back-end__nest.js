import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;

  beforeEach(() => {
    authGuard = new AuthGuard();
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it(`should return false if there's no user object on request object`, () => {
    const context: ExecutionContext = ({
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getRequest: jest.fn().mockReturnValue({}) }),
    } as unknown) as ExecutionContext;

    expect(authGuard.canActivate(context)).toBe(false);
  });

  it(`should return true if there's user object on request object`, () => {
    const context: ExecutionContext = ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: {} }),
      }),
    } as unknown) as ExecutionContext;

    expect(authGuard.canActivate(context)).toBe(true);
  });
});
