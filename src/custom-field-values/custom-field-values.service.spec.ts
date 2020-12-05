import {
  ER_NO_REFERENCED_ROW_2,
  ER_DUP_ENTRY,
} from 'mysql/lib/protocol/constants/errors';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CustomFieldValuesService } from './custom-field-values.service';
import { CreateCustomFieldValueDto } from './dto/create-custom-field-value.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';
import { DuplicatedCustomFieldValueException } from './exceptions/duplicated-custom-field-value.exception';
import { CustomFieldNotFoundException } from '../custom-fields/exceptions/custom-field-not-found.exception';

describe('CustomFieldValuesService', () => {
  let service: CustomFieldValuesService, repo: Repository<CustomFieldValue>;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomFieldValuesService,
        {
          provide: getRepositoryToken(CustomFieldValue),
          useValue: {
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CustomFieldValuesService>(CustomFieldValuesService);
    repo = module.get<Repository<CustomFieldValue>>(
      getRepositoryToken(CustomFieldValue),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`create(createCustomFieldValueDto:CreateCustomFieldValueDto)`, () => {
    it(`should return created custom field value`, () => {
      const createdCustomFieldValue = {} as CustomFieldValue;

      jest.spyOn(repo, 'save').mockResolvedValue(createdCustomFieldValue);

      return expect(
        service.create({} as CreateCustomFieldValueDto),
      ).resolves.toEqual(createdCustomFieldValue);
    });

    it(`should throw DuplicatedCustomFieldValueException`, () => {
      const error: any = new QueryFailedError('lorem', [], {});

      error.errno = ER_DUP_ENTRY;

      jest.spyOn(repo, 'save').mockRejectedValue(error);

      return expect(
        service.create({} as CreateCustomFieldValueDto),
      ).rejects.toThrow(DuplicatedCustomFieldValueException);
    });

    it(`should throw CustomFieldNotFoundException`, () => {
      const error: any = new QueryFailedError('lorem', [], {});

      error.errno = ER_NO_REFERENCED_ROW_2;

      jest.spyOn(repo, 'save').mockRejectedValue(error);

      return expect(
        service.create({} as CreateCustomFieldValueDto),
      ).rejects.toThrow(CustomFieldNotFoundException);
    });

    it(`should throw what is thrown by the service`, () => {
      const error = new Error();

      jest.spyOn(repo, 'save').mockRejectedValue(error);

      return expect(
        service.create({} as CreateCustomFieldValueDto),
      ).rejects.toThrow(error);
    });
  });

  describe(`findAll()`, () => {
    it(`should return all custom field values`, () => {
      const customFieldValues = [{}, {}] as CustomFieldValue[];

      jest.spyOn(repo, 'find').mockResolvedValue(customFieldValues);

      return expect(service.findAll()).resolves.toEqual(customFieldValues);
    });

    it(`should return empty array`, () => {
      jest.spyOn(repo, 'find').mockResolvedValue([]);

      return expect(service.findAll()).resolves.toEqual([]);
    });
  });

  describe(`findOne(id: number)`, () => {
    it(`should return a custom field value`, () => {
      const customFieldValue = {} as CustomFieldValue;

      jest.spyOn(repo, 'findOne').mockResolvedValue(customFieldValue);

      return expect(service.findOne(1)).resolves.toEqual(customFieldValue);
    });

    it(`should return undefined`, () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

      return expect(service.findOne(1)).resolves.toEqual(undefined);
    });
  });

  describe(`update(id: number, updateCustomFieldValueDto: UpdateCustomFieldValueDto)`, () => {
    it(`should return updated custom field value`, () => {
      const updatedCustomFieldValue = {} as CustomFieldValue;

      jest.spyOn(repo, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(repo, 'findOne').mockResolvedValue(updatedCustomFieldValue);

      return expect(
        service.update(1, {} as UpdateCustomFieldValueDto),
      ).resolves.toEqual(updatedCustomFieldValue);
    });

    it(`should throw CustomFieldValueNotFoundException`, () => {
      jest.spyOn(repo, 'update').mockResolvedValue({ affected: 0 } as any);

      return expect(
        service.update(1, {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(CustomFieldValueNotFoundException);
    });

    it(`should throw DuplicatedCustomFieldValueException`, () => {
      const error: any = new QueryFailedError('lorem', [], {});

      error.errno = ER_DUP_ENTRY;

      jest.spyOn(repo, 'update').mockRejectedValue(error);

      return expect(
        service.update(1, {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(DuplicatedCustomFieldValueException);
    });

    it(`should throw what is thrown by the service`, () => {
      const error = new Error();

      jest.spyOn(repo, 'update').mockRejectedValue(error);

      return expect(
        service.update(1, {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(error);
    });
  });

  describe(`remove(id: number)`, () => {
    it(`should return removed custom field value id`, () => {
      const id = 1;

      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 1 } as any);

      return expect(service.remove(id)).resolves.toEqual(id);
    });

    it(`should throw CustomFieldValueNotFoundException`, () => {
      jest.spyOn(repo, 'delete').mockResolvedValue({ affected: 0 } as any);

      return expect(service.remove(1)).rejects.toThrow(
        CustomFieldValueNotFoundException,
      );
    });

    it(`should throw what is thrown by the service`, () => {
      const error = new Error();

      jest.spyOn(repo, 'delete').mockRejectedValue(error);

      return expect(service.remove(1)).rejects.toThrow(error);
    });
  });
});
