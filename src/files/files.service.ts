import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { MulterFile } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File) private filesRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async create(file: MulterFile): Promise<File> {
    const appUrl = this.configService.get<string>('url');

    const fileEntity: File = this.filesRepository.create({
      ...file,
      type: file.mimetype,
      path: appUrl + file.filename,
    });

    return this.filesRepository.save(fileEntity);
  }

  findAll(): Promise<File[]> {
    return this.filesRepository.find();
  }

  findOne(id: number): Promise<File> {
    return this.filesRepository.findOne(id);
  }

  async update(id: number, updateFileDto: UpdateFileDto): Promise<File> {
    const updateResult: UpdateResult = await this.filesRepository.update(
      id,
      updateFileDto,
    );

    if (updateResult.affected === 0) throw new FileNotFoundException();

    return this.findOne(id);
  }

  async remove(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.filesRepository.delete(id);

    if (deleteResult.affected === 0) throw new FileNotFoundException();

    return id;
  }
}
