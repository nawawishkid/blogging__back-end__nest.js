import { IsEmail, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
