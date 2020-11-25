import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const meta = {
      namespace: `Guard:${AuthGuard.name}`,
    };
    this.logger.verbose(`canActivate()`, meta);

    const req = context.switchToHttp().getRequest();
    const result = !!req.user;

    this.logger.debug(`Result: ${result}`, meta);
    this.logger.verbose(`End of canActivate()\n\n`, meta);

    return result;
  }
}
