import { IsInt, IsObject, IsString, IsUrl } from 'class-validator';

export class FileObject {
  @IsUrl()
  path: string;

  @IsInt()
  size: number;

  @IsString()
  type: string;
}
export class CreateFileDto {
  @IsString()
  name: string;

  @IsObject()
  file: FileObject;
}
