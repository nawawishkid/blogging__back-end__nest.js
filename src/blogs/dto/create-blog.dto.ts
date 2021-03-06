import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsInt()
  authorId: number;

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsInt({ each: true })
  customFieldValueIds?: number[];
}
