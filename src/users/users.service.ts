import { ER_DUP_ENTRY } from 'mysql/lib/protocol/constants/errors';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserAlreadyExistsException } from './exceptions/user-already-exists.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { hash } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Prevent upsertion from repo.save() method
      delete (createUserDto as any).id;

      const hashedPassword = await hash(createUserDto.password, 10);

      const createdUser: User = await this.usersRepository.save({
        ...createUserDto,
        password: hashedPassword,
      });

      return this.findOne(createdUser.id);
    } catch (e) {
      if (
        ((e instanceof QueryFailedError) as any) &&
        e.errno === ER_DUP_ENTRY
      ) {
        throw new UserAlreadyExistsException();
      }

      throw e;
    }
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  async findByEmailReturnedWithPassword(email: string): Promise<User> {
    const foundUser = await this.usersRepository
      .createQueryBuilder(`user`)
      .where(`user.email = :email`, { email })
      .addSelect(`user.password`)
      .getOne();

    return foundUser;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const updateResult: UpdateResult = await this.usersRepository.update(
      id,
      updateUserDto,
    );

    if (updateResult.affected === 0) throw new UserNotFoundException();

    const updatedUser: User = await this.findOne(id);

    return updatedUser;
  }

  async remove(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.usersRepository.delete(id);

    if (deleteResult.affected === 0) throw new UserNotFoundException();

    return id;
  }
}
