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
import {
  ExpressSessionDataDto,
  UpdateSessionDto,
} from './dto/update-session.dto';
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
import { SessionNotFoundException } from './exceptions/session-not-found.exception';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  async create(
    @Body() createSessionDto: CreateSessionDto,
    @Session() session,
  ): Promise<CreateSessionResponseDto> {
    try {
      const createdSession = await this.sessionsService.create(
        session.id,
        createSessionDto,
        session,
      );

      return { createdSession };
    } catch (e) {
      if (
        e instanceof EmailNotFoundException ||
        e instanceof IncorrectPasswordException
      ) {
        throw new UnauthorizedException();
      }

      throw new InternalServerErrorException(e);
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@User() user: UserEntity): Promise<FindAllSessionsResponseDto> {
    const sessions:
      | SessionEntity[]
      | undefined = await this.sessionsService.findAll(user.id);

    if (!sessions || (Array.isArray(sessions) && sessions.length === 0)) {
      throw new NotFoundException();
    }

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
    @User() user: UserEntity,
    @Session() session: ExpressSessionDataDto,
    @Body() updateSessionDto: UpdateSessionDto,
  ): Promise<UpdateSessionResponseDto> {
    if (!('userId' in updateSessionDto)) {
      updateSessionDto.userId = user.id;
    }

    const updatedSession = await this.sessionsService.update(
      id,
      session,
      updateSessionDto,
    );

    return { updatedSession };
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.sessionsService.remove(id);
    } catch (e) {
      if (e instanceof SessionNotFoundException) {
        throw new NotFoundException();
      }

      throw new InternalServerErrorException();
    }
  }
}
