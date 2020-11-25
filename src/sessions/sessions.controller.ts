import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
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
  Inject,
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
import {
  CreateSessionResponseDto,
  FindAllSessionsResponseDto,
  FindOneSessionResponseDto,
  UpdateSessionResponseDto,
} from './dto/response.dto';

@Controller('sessions')
export class SessionsController {
  private readonly logger: Logger;

  constructor(
    private readonly sessionsService: SessionsService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly parentLogger: Logger,
  ) {
    this.logger = this.parentLogger.child({
      namespace: `Controller:${SessionsController.name}`,
    });
  }

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Session() session,
  ): Promise<CreateSessionResponseDto> {
    this.logger.verbose(`create()`);
    this.logger.verbose('Creating session...');

    try {
      const createdSession = await this.sessionsService.create(
        session.id,
        createSessionDto,
        session,
      );

      this.logger.verbose(`Create a new session successfully`);
      this.logger.debug(
        `Created session ${JSON.stringify(createdSession, null, 2)}`,
      );

      return { createdSession };
    } catch (e) {
      this.logger.verbose(`An error occurred while creating a new session`);
      this.logger.error(e);
      if (
        e instanceof EmailNotFoundException ||
        e instanceof IncorrectPasswordException
      ) {
        this.logger.verbose(`Throw UnauthorizedException`);
        throw new UnauthorizedException();
      }

      this.logger.verbose(`Throw InternalServerErrorException`);
      throw new InternalServerErrorException(e);
    } finally {
      this.logger.verbose(`End of create()`);
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@User() user: UserEntity): Promise<FindAllSessionsResponseDto> {
    this.logger.debug(`findAll()`);
    this.logger.verbose(`Getting sessions of the user with id: ${user.id}`);
    const sessions:
      | SessionEntity[]
      | undefined = await this.sessionsService.findAll(user.id);

    this.logger.verbose(`Found ${sessions ? sessions.length : '0'} session(s)`);

    if (!sessions || (Array.isArray(sessions) && sessions.length === 0)) {
      this.logger.debug(`End of findAll()`);
      throw new NotFoundException();
    }

    this.logger.debug(`End of findAll()`);
    return { sessions };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneSessionResponseDto> {
    const session = await this.sessionsService.findOne(id);

    if (!session) throw new NotFoundException();

    return { session };
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<UpdateSessionResponseDto> {
    this.logger.verbose(`Updating a session...`);

    const updatedSession = await this.sessionsService.update(
      id,
      updateSessionDto,
    );

    return { updatedSession };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    const deletedSessionId = await this.sessionsService.remove(id);

    if (deletedSessionId === null) throw new NotFoundException();
  }
}
