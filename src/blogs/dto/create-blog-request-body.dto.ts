import { IsOptional, IsString } from 'class-validator';

export class CreateBlogRequestBodyDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;
}
