import { IsOptional, IsString } from 'class-validator';

export class CreateCustomFieldValueRequestBodyDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;
}
