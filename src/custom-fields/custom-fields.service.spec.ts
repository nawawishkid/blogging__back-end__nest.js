import { ER_DUP_ENTRY } from 'mysql/lib/protocol/constants/errors';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';
import { DuplicatedCustomFieldException } from './exceptions/duplicated-custom-field.exception';

describe('CustomFieldsService', () => {
  let service: CustomFieldsService,
    customFieldsRepository: Repository<CustomField>;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomFieldsService,
        {
          provide: getRepositoryToken(CustomField),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn,
            save: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomFieldsService>(CustomFieldsService);
    customFieldsRepository = module.get<Repository<CustomField>>(
      getRepositoryToken(CustomField),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it(`should return all customFields`, () => {
      const foundCustomFields = [{}, {}] as CustomField[];

      jest
        .spyOn(customFieldsRepository, 'find')
        .mockResolvedValue(foundCustomFields);

      return expect(service.findAll()).resolves.toEqual(foundCustomFields);
    });

    it(`should return undefined it there's no customField found`, () => {
      jest.spyOn(customFieldsRepository, 'find').mockResolvedValue(undefined);

      return expect(service.findAll()).resolves.toBeUndefined();
    });
  });

  describe(`findOne(customFieldId: number)`, () => {
    it(`should return the customField with the given id`, () => {
      const foundCustomField: CustomField = {} as CustomField;

      jest
        .spyOn(customFieldsRepository, 'findOne')
        .mockResolvedValue(foundCustomField);

      return expect(service.findOne(1)).resolves.toEqual(foundCustomField);
    });

    it(`should return undefined it there's no customField found`, () => {
      jest
        .spyOn(customFieldsRepository, 'findOne')
        .mockResolvedValue(undefined);

      return expect(service.findOne(1)).resolves.toBeUndefined();
    });
  });

  describe(`create(createCustomFieldDto: CreateCustomFieldDto)`, () => {
    it(`should return the created customField`, () => {
      const createCustomFieldDto: CreateCustomFieldDto = {
        name: `Phase`,
      };
      const createdCustomField: CustomField = {} as CustomField;

      jest.spyOn(service, 'findOne').mockResolvedValue(createdCustomField);
      jest
        .spyOn(customFieldsRepository, 'save')
        .mockResolvedValue(createdCustomField);

      return expect(service.create(createCustomFieldDto)).resolves.toEqual(
        createdCustomField,
      );
    });

    it(`should throw DuplicatedCustomFieldException`, () => {
      const error: any = new QueryFailedError('lorem', [], {});

      error.errno = ER_DUP_ENTRY;

      jest.spyOn(customFieldsRepository, 'save').mockRejectedValue(error);

      return expect(service.create({} as CreateCustomFieldDto)).rejects.toThrow(
        DuplicatedCustomFieldException,
      );
    });

    it(`should throw what is thrown by the repo`, () => {
      jest.spyOn(customFieldsRepository, 'save').mockRejectedValue(new Error());

      return expect(service.create({} as CreateCustomFieldDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe(`update(customFieldId: number, updateCustomFieldDto: UpdateCustomFieldDto)`, () => {
    it(`should return the updated customField`, () => {
      const updateCustomFieldDto: UpdateCustomFieldDto = {};
      const updatedCustomField: CustomField = {} as CustomField;

      jest
        .spyOn(customFieldsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(customFieldsRepository, 'findOne')
        .mockResolvedValue(updatedCustomField);

      return expect(service.update(1, updateCustomFieldDto)).resolves.toEqual(
        updatedCustomField,
      );
    });

    it(`should throw the CustomFieldNotFoundException if a customField with the given customField id could not be found (no upsert)`, () => {
      jest
        .spyOn(customFieldsRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(
        service.update(1, {} as UpdateCustomFieldDto),
      ).rejects.toThrow(CustomFieldNotFoundException);
    });

    it(`should throw what is thrown by the repo`, () => {
      jest.spyOn(customFieldsRepository, 'save').mockRejectedValue(new Error());

      return expect(
        service.update(1, {} as UpdateCustomFieldDto),
      ).rejects.toThrow(Error);
    });
  });

  describe(`remove(customFieldId: number)`, () => {
    it(`should return the removed customField id`, () => {
      const customFieldId = 1;

      jest
        .spyOn(customFieldsRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      return expect(service.remove(customFieldId)).resolves.toEqual(
        customFieldId,
      );
    });

    it(`should throw the CustomFieldNotFoundException if a customField with the given customField id could not be found`, () => {
      jest
        .spyOn(customFieldsRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(service.remove(1)).rejects.toThrow(
        CustomFieldNotFoundException,
      );
    });
  });
});
