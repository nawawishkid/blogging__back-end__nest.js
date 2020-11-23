import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCustomFieldValueDto {
  @IsInt()
  customFieldValueId: number;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description: string;
}
