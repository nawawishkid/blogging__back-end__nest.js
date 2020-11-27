import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository, UpdateResult } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import {
  ExpressSessionDataDto,
  UpdateSessionDto,
} from './dto/update-session.dto';
import { Session } from './entities/session.entity';
import { SessionData } from 'express-session';
import { SessionNotFoundException } from './exceptions/session-not-found.exception';

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

    this.logger.debug(`Authenticated user:`, { json: user });
    session.user = { id: user.id };

    const createdSession = await this.update(sid, session, {
      userId: user.id,
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
    session: SessionData,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    this.logger.verbose(`update()`);
    this.logger.verbose(`Updating a session...`);
    this.logger.debug(`Session ID: ${id}`);
    this.logger.debug(`Session:`, { json: session });
    this.logger.debug(`updateSessionDto:`, { json: updateSessionDto });

    const sessionEntity = this.updateSessionDtoToSessionEntity(
      id,
      session,
      updateSessionDto,
    );
    this.logger.debug(`Mapped session entity:`, { json: sessionEntity });
    /**
     * @TODO repo.save() allows upserting data. Use repo.update() instead.
     */
    const updatedSession = await this.sessionsRepository.save(sessionEntity);
    this.logger.debug(`Updated session:`, { json: updatedSession });
    this.logger.verbose(`Update session successfully`);
    this.logger.verbose(`End of update()`);

    return updatedSession;
  }

  async remove(id: string): Promise<string> {
    const updateResult: UpdateResult = await this.sessionsRepository.update(
      id,
      {
        isRevoked: true,
      },
    );

    if (updateResult.affected === 0) throw new SessionNotFoundException();

    return id;
  }

  private updateSessionDtoToSessionEntity(
    sid: string,
    session: ExpressSessionDataDto,
    updateSessionDto: UpdateSessionDto,
  ): Partial<Session> {
    this.logger.verbose(`Creating session entity from updateSessionDto...`);
    const { data, isRevoked, userId } = updateSessionDto;

    for (let key in data) {
      session[key] = data[key];
    }

    const result = {
      id: sid,
      data: JSON.stringify(session),
      expiresAt: session.cookie.expires.toISOString(),
      isRevoked,
      userId,
    };

    return result;
  }
}
