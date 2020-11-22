import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  it('should be defined', () => {
    expect(new AuthGuard()).toBeDefined();
  });

  it(`should return false if there's no user object on request object`, () => {
    const authGuard: AuthGuard = new AuthGuard();
    const context: ExecutionContext = ({
      switchToHttp: jest
        .fn()
        .mockReturnValue({ getRequest: jest.fn().mockReturnValue({}) }),
    } as unknown) as ExecutionContext;

    expect(authGuard.canActivate(context)).toBe(false);
  });

  it(`should return true if there's user object on request object`, () => {
    const authGuard: AuthGuard = new AuthGuard();
    const context: ExecutionContext = ({
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user: {} }),
      }),
    } as unknown) as ExecutionContext;

    expect(authGuard.canActivate(context)).toBe(true);
  });
});
