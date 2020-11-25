import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(e: unknown, host: ArgumentsHost) {
    const namespace = `Filter:${AppExceptionFilter.name}`;
    const res = host.switchToHttp().getResponse<Response>();

    this.logger.error(`An unhandled error occurred:`, {
      namespace,
      json: e,
    });

    if (res.headersSent) {
      this.logger.debug(`Header has already been sent. Stop response process`, {
        namespace,
      });
      return;
    }

    if (e instanceof HttpException) {
      return res.status(e.getStatus()).json(e.getResponse());
    }

    res.status(500).json(e);
  }
}
