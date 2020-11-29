import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FileNotFoundException } from './exceptions/file-not-found.exception';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

describe('FilesController', () => {
  let controller: FilesController, filesService: FilesService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get<FilesService>(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`findAll()`, () => {
    it(`should return all files`, () => {
      const foundFiles: File[] = [{}, {}] as File[];

      jest.spyOn(filesService, 'findAll').mockResolvedValue(foundFiles as any);

      return expect(controller.findAll()).resolves.toEqual({
        files: foundFiles,
      });
    });

    it(`should throw the NotFoundException if there's no file`, () => {
      jest.spyOn(filesService, 'findAll').mockResolvedValue(undefined);

      return expect(controller.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe(`findOne(fileId: string)`, () => {
    it(`should return a file with the given id`, () => {
      const foundFile: File = {} as File;

      jest.spyOn(filesService, 'findOne').mockResolvedValue(foundFile as any);

      return expect(controller.findOne('1')).resolves.toEqual({
        file: foundFile,
      });
    });

    it(`should throw the NotFoundException if a file with the given file id could not be found`, () => {
      jest.spyOn(filesService, 'findOne').mockResolvedValue(undefined);

      return expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe(`create(createFileDto: CreateFileDto)`, () => {
    it(`should return the created file`, () => {
      const file: Express.Multer.File = {} as Express.Multer.File;
      const createdFile: File = {} as File;

      jest.spyOn(filesService, 'create').mockResolvedValue(createdFile as any);

      return expect(controller.create(file)).resolves.toEqual({
        createdFile,
      });
    });
  });

  describe(`remove(fileId: string)`, () => {
    it(`should return nothing if successfully removed`, () => {
      const fileId = '1';

      jest.spyOn(filesService, 'remove').mockResolvedValue(+fileId);

      return expect(controller.remove(fileId)).resolves.toBeUndefined();
    });

    it(`should throw the NotFoundException if a file with the given id could not be found to remove`, () => {
      jest
        .spyOn(filesService, 'remove')
        .mockRejectedValue(new FileNotFoundException());

      return expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it(`should throw what is thrown by filesService`, () => {
      const error = new Error();

      jest.spyOn(filesService, 'remove').mockRejectedValue(error);

      return expect(controller.remove('1')).rejects.toThrow(error);
    });
  });
});
