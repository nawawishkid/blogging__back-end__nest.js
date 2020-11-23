import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { File } from './entities/file.entity';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import { FilesService } from './files.service';

describe('FilesService', () => {
  let service: FilesService, filesRepository: Repository<File>;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: getRepositoryToken(File),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn,
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    filesRepository = module.get<Repository<File>>(getRepositoryToken(File));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it(`should return all files`, () => {
      const foundFiles = [{}, {}] as File[];

      jest.spyOn(filesRepository, 'find').mockResolvedValue(foundFiles);

      return expect(service.findAll()).resolves.toEqual(foundFiles);
    });

    it(`should return undefined it there's no file found`, () => {
      jest.spyOn(filesRepository, 'find').mockResolvedValue(undefined);

      return expect(service.findAll()).resolves.toBeUndefined();
    });
  });

  describe(`findOne(fileId: number)`, () => {
    it(`should return the file with the given id`, () => {
      const foundFile: File = {} as File;

      jest.spyOn(filesRepository, 'findOne').mockResolvedValue(foundFile);

      return expect(service.findOne(1)).resolves.toEqual(foundFile);
    });

    it(`should return undefined it there's no file found`, () => {
      jest.spyOn(filesRepository, 'findOne').mockResolvedValue(undefined);

      return expect(service.findOne(1)).resolves.toBeUndefined();
    });
  });

  describe(`create(createFileDto: CreateFileDto)`, () => {
    it(`should return the created file`, () => {
      const createdFile: File = {} as File;

      jest.spyOn(filesRepository, 'save').mockResolvedValue(createdFile);

      return expect(service.create({} as CreateFileDto)).resolves.toEqual(
        createdFile,
      );
    });
  });

  describe(`update(fileId: number, updateFileDto: UpdateFileDto)`, () => {
    it(`should return the updated file`, () => {
      const updatedFile: File = {} as File;

      jest
        .spyOn(filesRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(filesRepository, 'findOne').mockRejectedValue(updatedFile);

      return expect(service.update(1, {} as UpdateFileDto)).resolves.toEqual(
        updatedFile,
      );
    });

    it(`should throw the FileNotFoundException if a file with the given file id could not be found (no upsert)`, () => {
      jest
        .spyOn(filesRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(service.update(1, {} as UpdateFileDto)).rejects.toThrow(
        FileNotFoundException,
      );
    });
  });

  describe(`remove(fileId: number)`, () => {
    it(`should return the removed file id`, () => {
      const fileId = 1;

      jest
        .spyOn(filesRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      return expect(service.remove(fileId)).resolves.toEqual(fileId);
    });

    it(`should throw the FileNotFoundException if a file with the given file id could not be found`, () => {
      jest
        .spyOn(filesRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(service.remove(1)).rejects.toThrow(FileNotFoundException);
    });
  });
});
