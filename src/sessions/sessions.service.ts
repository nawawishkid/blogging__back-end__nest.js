import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  ExpressSessionDataDto,
  UpdateSessionDto,
} from './dto/update-session.dto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Session) private sessionsRepository: Repository<Session>,
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly parentLogger: Logger,
  ) {
    this.logger = this.parentLogger.child({
      namespace: `Service:${SessionsService.name}`,
    });
  }

  async create(
    sid: string,
    createSessionDto: CreateSessionDto,
    session: ExpressSessionDataDto,
  ): Promise<Session> {
    this.logger.verbose(`create()`);
    this.logger.verbose(`Creating a new session...`);
    const { email, password } = createSessionDto;
    this.logger.debug(`email: "${email}"; password: "${password}"`);
    this.logger.verbose(`Authenticating user with the given credential...`);

    /**
     * @TODO Implement this in guard
     */
    const user = await this.authService.authenticate(email, password);

    this.logger.debug(`Authenticated user: ${JSON.stringify(user, null, 2)}`);
    session.user = { id: user.id };

    const createdSession = await this.update(sid, {
      userId: user.id,
      data: session,
    });

    this.logger.verbose(`End of create()`);

    return createdSession;
  }

  findAll(userId: number): Promise<Session[]> {
    return this.sessionsRepository.find({ where: { userId } });
  }

  findOne(id: string): Promise<Session> {
    return this.sessionsRepository.findOne(id);
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    this.logger.verbose(`update()`);
    this.logger.verbose(`Updating a session...`);
    this.logger.debug(
      `Recieved updateSessionDto: ${JSON.stringify(updateSessionDto, null, 2)}`,
    );

    const sessionEntity = this.updateSessionDtoToSessionEntity(
      id,
      updateSessionDto,
    );
    this.logger.debug(
      `Mapped session entity: ${JSON.stringify(sessionEntity, null, 2)}`,
    );
    const updatedSession = await this.sessionsRepository.save(sessionEntity);
    this.logger.verbose(`Update session successfully`);
    this.logger.debug(
      `Updated session: ${JSON.stringify(updatedSession, null, 2)}`,
    );
    this.logger.verbose(`End of update()`);

    return updatedSession;
  }

  async remove(id: string): Promise<string> {
    const session = await this.sessionsRepository.save({ id, isRevoked: true });

    return session.id;
  }

  private updateSessionDtoToSessionEntity(sid, updateSessionDto) {
    const { data, ...rest } = updateSessionDto;

    return {
      id: sid,
      data: JSON.stringify(data),
      expiresAt: data.cookie._expires,
      ...rest,
    };
  }
}
