import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { Repository } from 'typeorm';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private sessionsRepository: Repository<Session>,
    private readonly authService: AuthService,
  ) {}

  async create(
    sid: string,
    createSessionDto: CreateSessionDto,
    session: any,
  ): Promise<Session> {
    const { email, password } = createSessionDto;

    try {
      const user = await this.authService.authenticate(email, password);

      return this.update(sid, {
        userId: user.id,
        data: session,
      });
    } catch (e) {
      throw e;
    }
  }

  findAll(userId: number): Promise<Session[]> {
    return this.sessionsRepository.find({ where: { id: userId } });
  }

  findOne(id: string): Promise<Session> {
    return this.sessionsRepository.findOne(id);
  }

  async update(
    id: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const updatedSession = await this.sessionsRepository.save(
      this.updateSessionDtoToSessionEntity(id, updateSessionDto),
    );

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
