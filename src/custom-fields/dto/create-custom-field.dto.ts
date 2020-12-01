import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCustomFieldDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  values?: string[];
}
