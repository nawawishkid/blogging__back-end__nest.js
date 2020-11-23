import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomFieldValuesService } from './custom-field-values.service';
import { CreateCustomFieldValueDto } from './dto/create-custom-field-value.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';

describe('CustomFieldValuesService', () => {
  let service: CustomFieldValuesService,
    customFieldValuesRepository: Repository<CustomFieldValue>;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomFieldValuesService,
        {
          provide: getRepositoryToken(CustomFieldValue),
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

    service = module.get<CustomFieldValuesService>(CustomFieldValuesService);
    customFieldValuesRepository = module.get<Repository<CustomFieldValue>>(
      getRepositoryToken(CustomFieldValue),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it(`should return all customFieldValues`, () => {
      const foundCustomFieldValues = [{}, {}] as CustomFieldValue[];

      jest
        .spyOn(customFieldValuesRepository, 'find')
        .mockResolvedValue(foundCustomFieldValues);

      return expect(service.findAll()).resolves.toEqual(foundCustomFieldValues);
    });

    it(`should return undefined it there's no customFieldValue found`, () => {
      jest
        .spyOn(customFieldValuesRepository, 'find')
        .mockResolvedValue(undefined);

      return expect(service.findAll()).resolves.toBeUndefined();
    });
  });

  describe(`findOne(customFieldValueId: number)`, () => {
    it(`should return the customFieldValue with the given id`, () => {
      const foundCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesRepository, 'findOne')
        .mockResolvedValue(foundCustomFieldValue);

      return expect(service.findOne(1)).resolves.toEqual(foundCustomFieldValue);
    });

    it(`should return undefined it there's no customFieldValue found`, () => {
      jest
        .spyOn(customFieldValuesRepository, 'findOne')
        .mockResolvedValue(undefined);

      return expect(service.findOne(1)).resolves.toBeUndefined();
    });
  });

  describe(`create(createCustomFieldValueDto: CreateCustomFieldValueDto)`, () => {
    it(`should return the created customFieldValue`, () => {
      const createdCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesRepository, 'save')
        .mockResolvedValue(createdCustomFieldValue);

      return expect(
        service.create({} as CreateCustomFieldValueDto),
      ).resolves.toEqual(createdCustomFieldValue);
    });
  });

  describe(`update(customFieldValueId: number, updateCustomFieldValueDto: UpdateCustomFieldValueDto)`, () => {
    it(`should return the updated customFieldValue`, () => {
      const updatedCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(customFieldValuesRepository, 'findOne')
        .mockResolvedValue(updatedCustomFieldValue);

      return expect(
        service.update(1, {} as UpdateCustomFieldValueDto),
      ).resolves.toEqual(updatedCustomFieldValue);
    });

    it(`should throw the CustomFieldValueNotFoundException if a customFieldValue with the given customFieldValue id could not be found (no upsert)`, () => {
      jest
        .spyOn(customFieldValuesRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(
        service.update(1, {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(CustomFieldValueNotFoundException);
    });
  });

  describe(`remove(customFieldValueId: number)`, () => {
    it(`should return the removed customFieldValue id`, () => {
      const customFieldValueId = 1;

      jest
        .spyOn(customFieldValuesRepository, 'delete')
        .mockResolvedValue({ affected: 1 } as any);

      return expect(service.remove(customFieldValueId)).resolves.toEqual(
        customFieldValueId,
      );
    });

    it(`should throw the CustomFieldValueNotFoundException if a customFieldValue with the given customFieldValue id could not be found`, () => {
      jest
        .spyOn(customFieldValuesRepository, 'delete')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(service.remove(1)).rejects.toThrow(
        CustomFieldValueNotFoundException,
      );
    });
  });
});
