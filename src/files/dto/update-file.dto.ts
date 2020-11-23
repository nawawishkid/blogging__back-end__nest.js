import { IsString } from 'class-validator';

export class UpdateFileDto {
  @IsString()
  name: string;
}
