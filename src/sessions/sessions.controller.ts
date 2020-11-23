import {
  Session,
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  HttpCode,
  UnauthorizedException,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { Session as SessionEntity } from './entities/session.entity';
import { User } from '../users/user.decorator';
import { User as UserEntity } from '../users/entities/user.entity';
import { EmailNotFoundException } from './exceptions/email-not-found.exception';
import { IncorrectPasswordException } from './exceptions/incorrect-password.exception';
import { AuthGuard } from '../auth.guard';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Session() session,
  ): Promise<SessionEntity> {
    try {
      return await this.sessionsService.create(
        session.id,
        createSessionDto,
        session,
      );
    } catch (e) {
      if (
        e instanceof EmailNotFoundException ||
        e instanceof IncorrectPasswordException
      )
        throw new UnauthorizedException();

      throw new InternalServerErrorException(e);
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@User() user: UserEntity): Promise<SessionEntity[]> {
    const foundSessions: SessionEntity[] = await this.sessionsService.findAll(
      user.id,
    );

    if (
      !foundSessions ||
      (Array.isArray(foundSessions) && foundSessions.length === 0)
    )
      throw new NotFoundException();

    return foundSessions;
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SessionEntity> {
    const foundSession = await this.sessionsService.findOne(id);

    if (!foundSession) throw new NotFoundException();

    return foundSession;
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<SessionEntity> {
    return this.sessionsService.update(id, updateSessionDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const deletedSessionId = await this.sessionsService.remove(id);

    if (deletedSessionId === null) throw new NotFoundException();
  }
}
