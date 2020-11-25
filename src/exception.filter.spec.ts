import { createLogger, transports } from 'winston';
import { AppExceptionFilter } from './exception.filter';

describe('ExceptionFilter', () => {
  it('should be defined', () => {
    expect(
      new AppExceptionFilter(
        createLogger({
          transports: [new transports.Console({ silent: true })],
        }),
      ),
    ).toBeDefined();
  });
});
