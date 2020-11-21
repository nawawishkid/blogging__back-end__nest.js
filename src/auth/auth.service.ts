import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { EmailNotFoundException } from '../sessions/exceptions/email-not-found.exception';
import { IncorrectPasswordException } from '../sessions/exceptions/incorrect-password.exception';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async authenticate(email: string, password: string) {
    const user: User = await this.usersService.findByEmail(email, ['password']);

    if (!user) throw new EmailNotFoundException(email);

    const passwordMatched = await bcrypt.compare(password, user.password);

    if (!passwordMatched) throw new IncorrectPasswordException();

    return user;
  }
}
