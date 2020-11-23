import { File } from '../entities/file.entity';

export class CreateFileResponseDto {
  createdFile: File;
}

export class UpdateFileResponseDto {
  updatedFile: File;
}

export class FindAllFilesResponseDto {
  files: File[];
}

export class FindOneFileResponseDto {
  file: File;
}
