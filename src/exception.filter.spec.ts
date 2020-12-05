import { ArgumentsHost, NotFoundException } from '@nestjs/common';
import * as httpExceptionsModule from '@nestjs/common/exceptions';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import { Response } from 'express';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { createLogger, transports } from 'winston';
import { AppExceptionFilter } from './exception.filter';

describe('ExceptionFilter', () => {
  let filter: AppExceptionFilter,
    res: Response,
    http: HttpArgumentsHost,
    host: ArgumentsHost;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        AppExceptionFilter,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: createLogger({
            transports: [new transports.Console({ silent: true })],
          }),
        },
      ],
    }).compile();

    filter = module.get<AppExceptionFilter>(AppExceptionFilter);
    res = ({
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown) as Response;
    http = ({
      getResponse: jest.fn().mockReturnValue(res),
    } as unknown) as HttpArgumentsHost;
    host = ({
      switchToHttp: jest.fn().mockReturnValue(http),
    } as unknown) as ArgumentsHost;
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it(`should return void if res.headerSent is true`, () => {
    res.headersSent = true;

    expect(filter.catch({}, host)).toBeUndefined();
  });

  it(`should call res.status() and res.json() to respond to a request`, () => {
    filter.catch({}, host);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it(`should set status and JSON response according to any HttpException`, () => {
    const httpExceptions = Object.values(httpExceptionsModule);

    for (const Exception of httpExceptions) {
      const error = new Exception(null, null as never);

      filter.catch(error, host);
      expect(res.status).toHaveBeenCalledWith(error.getStatus());
      expect(res.json).toHaveBeenCalledWith(error.getResponse());
    }
  });

  it(`should set status 500 and correct JSON response if the error is an instance of Error`, () => {
    const message = `Lorem ipsum dolor`;
    const error = new Error(message);

    error.name = `Aloha`;
    error.stack = `hahahaha`;
    (error as any).customProp = 100000;

    filter.catch(error, host);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      ...error,
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  });

  it(`should set status and JSON response of NotFoundException if the error is an ENOENT error`, () => {
    const error = new Error();
    const notFoundError = new NotFoundException();

    (error as any).code = `ENOENT`;

    filter.catch(error, host);

    expect(res.status).toHaveBeenCalledWith(notFoundError.getStatus());
    expect(res.json).toHaveBeenCalledWith(notFoundError.getResponse());
  });

  it(`should set status 500 and the error object as the JSON response`, () => {
    const obj = {};

    filter.catch(obj, host);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(obj);
  });
});
