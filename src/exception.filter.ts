import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(e: unknown, host: ArgumentsHost) {
    const namespace = `Filter:${AppExceptionFilter.name}`;

    this.logger.debug(`catch()`, { namespace });
    this.logger.verbose(`Catching an exception...`, { namespace });

    const res = host.switchToHttp().getResponse<Response>();
    let status, json;

    if (res.headersSent) {
      this.logger.error(`An unhandled error occurred:`, {
        namespace,
        json: e,
      });
      this.logger.verbose(
        `Header has already been sent. Stop response process`,
        {
          namespace,
        },
      );
      return;
    }

    if (e instanceof HttpException) {
      status = e.getStatus();
      json = e.getResponse();
    } else if (e instanceof Error) {
      if ((e as any).code === `ENOENT`) {
        const error = new NotFoundException();

        status = error.getStatus();
        json = error.getResponse();
      } else {
        this.logger.error(`An unhandled error occurred:`, {
          namespace,
          json: e,
        });

        status = 500;
        json = { ...e, name: e.name, message: e.message, stack: e.stack };
      }
    } else {
      this.logger.error(`An unhandled error occurred:`, {
        namespace,
        json: e,
      });

      status = 500;
      json = e;
    }

    this.logger.debug(`Respond with status ${status} and body:`, {
      json,
      namespace,
    });

    res.status(status).json(json);

    this.logger.debug(`End of catch()`, { namespace });
  }
}
