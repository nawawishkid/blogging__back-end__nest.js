import { diskStorage } from 'multer';
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { MulterFile } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import {
  CreateFileResponseDto,
  FindAllFilesResponseDto,
  FindOneFileResponseDto,
  UpdateFileResponseDto,
} from './dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @UseInterceptors(
    FileInterceptor(`file`, {
      storage: diskStorage({
        destination: 'public',
        filename(_, file, cb) {
          const splittedFilename = file.originalname.split('.');
          const ext = splittedFilename[splittedFilename.length - 1];
          const name =
            splittedFilename.length > 2
              ? splittedFilename.slice(0, -1).join('.')
              : splittedFilename[0];
          const [month, day, year] = new Date()
            .toLocaleDateString('en-US')
            .split('/');
          const date = [year, month, day].join('-');

          cb(null, `${date}-${name}-${Date.now()}.${ext}`);
        },
      }),
    }),
  )
  @Post()
  async create(
    @UploadedFile() file: MulterFile,
  ): Promise<CreateFileResponseDto> {
    const createdFile: File = await this.filesService.create(file);

    return { createdFile };
  }

  @Get()
  async findAll(): Promise<FindAllFilesResponseDto> {
    const files: File[] = await this.filesService.findAll();

    if (!files) throw new NotFoundException();

    return { files };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<FindOneFileResponseDto> {
    const file: File = await this.filesService.findOne(+id);

    if (!file) throw new NotFoundException();

    return { file };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<UpdateFileResponseDto> {
    try {
      const updatedFile: File = await this.filesService.update(
        +id,
        updateFileDto,
      );

      return { updatedFile };
    } catch (e) {
      if (e instanceof FileNotFoundException) throw new NotFoundException();

      throw e;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.filesService.remove(+id);
    } catch (e) {
      if (e instanceof FileNotFoundException) throw new NotFoundException();

      throw e;
    }
  }
}
