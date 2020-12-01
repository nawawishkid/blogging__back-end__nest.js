import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File) private filesRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async create(file: Express.Multer.File): Promise<File> {
    const appUrl = this.configService.get<string>('url');

    const fileEntity = {
      ...file,
      type: file.mimetype,
      path: appUrl + file.filename,
    };

    return this.filesRepository.save(fileEntity);
  }

  async findAll(): Promise<File[] | undefined> {
    const files: File[] = await this.filesRepository.find();

    if (files.length === 0) return undefined;

    return files;
  }

  findOne(id: number): Promise<File> {
    return this.filesRepository.findOne(id);
  }

  async remove(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.filesRepository.delete(id);

    if (deleteResult.affected === 0) throw new FileNotFoundException();

    return id;
  }
}
