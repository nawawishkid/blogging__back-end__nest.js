import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class MulterFile {
  @IsString()
  fieldName: string;

  @IsString()
  originalName: string;

  @IsString()
  encoding: string;

  @IsString()
  mimetype: string;

  @IsInt()
  size: number;

  @IsUrl()
  destination: string;

  @IsString()
  filename: string;

  @IsUrl()
  path: string;

  @Type(type => Buffer)
  buffer: Buffer;
}
export class CreateFileDto {
  @IsOptional()
  @IsString()
  name: string;
}
