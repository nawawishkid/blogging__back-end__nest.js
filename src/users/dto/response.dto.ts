import { User } from '../entities/user.entity';

export class CreateUserResponseDto {
  createdUser: User;
}

export class UpdateUserResponseDto {
  updatedUser: User;
}

export class FindAllUsersResponseDto {
  users: User[];
}

export class FindOneUserResponseDto {
  user: User;
}
