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
  InternalServerErrorException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import {
  CreateFileResponseDto,
  FindAllFilesResponseDto,
  FindOneFileResponseDto,
  UpdateFileResponseDto,
} from './dto/response.dto';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  async create(
    @Body() createFileDto: CreateFileDto,
  ): Promise<CreateFileResponseDto> {
    const createdFile: File = await this.filesService.create(createFileDto);

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

      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.filesService.remove(+id);
    } catch (e) {
      if (e instanceof FileNotFoundException) throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }
}
