import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UsersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();

    return next.handle().pipe(
      map(value => {
        if (handler.name === 'remove') return undefined;

        return { [this.getResourceKey(context.getHandler())]: value };
      }),
    );
  }

  private getResourceKey(method: Function): string {
    switch (method.name) {
      case 'findOne':
        return 'user';

      case 'create':
        return 'createdUser';

      case 'update':
        return 'updatedUser';

      default:
        return 'data';
    }
  }
}
