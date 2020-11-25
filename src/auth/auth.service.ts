import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as bcrypt from 'bcrypt';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EmailNotFoundException } from '../sessions/exceptions/email-not-found.exception';
import { IncorrectPasswordException } from '../sessions/exceptions/incorrect-password.exception';

@Injectable()
export class AuthService {
  private readonly logger: Logger;
  constructor(
    private usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly parentLogger: Logger,
  ) {
    this.logger = this.parentLogger.child({ namespace: AuthService.name });
  }

  async authenticate(email: string, password: string) {
    this.logger.verbose(`Authenticating user...`);
    this.logger.debug(`email: "${email}"; password: "${password}"`);
    const user: User = await this.usersService.findByEmail(email, ['password']);
    this.logger.debug(`user: ${JSON.stringify(user, null, 2)}`);

    if (!user) {
      this.logger.verbose(`throw EmailNotFoundException`);
      throw new EmailNotFoundException(email);
    }

    const passwordMatched = await bcrypt.compare(password, user.password);

    this.logger.debug(`passwordMatched: ${passwordMatched}`);

    if (!passwordMatched) {
      this.logger.verbose(`throw IncorrectPasswordException`);
      throw new IncorrectPasswordException();
    }

    return user;
  }
}
