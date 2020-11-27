import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserAlreadyExistsException } from './exceptions/user-already-exists.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { User } from './entities/user.entity';
import {
  CreateUserResponseDto,
  FindOneUserResponseDto,
  UpdateUserResponseDto,
} from './dto/response.dto';
import { AuthGuard } from '../auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    try {
      const createdUser: User = await this.usersService.create(createUserDto);

      return { createdUser };
    } catch (e) {
      if (e instanceof UserAlreadyExistsException) {
        throw new ConflictException(e);
      }

      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneUserResponseDto> {
    const user = await this.usersService.findOne(+id);

    if (!user) throw new NotFoundException();

    return { user };
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponseDto> {
    try {
      const updatedUser = await this.usersService.update(+id, updateUserDto);

      return { updatedUser };
    } catch (e) {
      if (e instanceof UserNotFoundException) throw new NotFoundException();
      if (e.name === `UpdateValuesMissingError`)
        throw new BadRequestException();

      throw e;
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.usersService.remove(+id);
    } catch (e) {
      if (e instanceof UserNotFoundException) throw new NotFoundException();

      throw e;
    }
  }
}
