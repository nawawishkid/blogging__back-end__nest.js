import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCustomFieldValueDto {
  @IsInt()
  customFieldId: number;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  description?: string;
}
