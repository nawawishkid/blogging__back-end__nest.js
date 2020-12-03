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
    it(`should return the created customField`, async () => {
      const createCustomFieldDto: CreateCustomFieldDto = {
        name: `Phase`,
        values: [`development`, `maintenance`, `design`],
      };
      const entity = {
        name: createCustomFieldDto.name,
        values: createCustomFieldDto.values.map(v => ({ value: v })),
      };

      jest
        .spyOn(customFieldsRepository, 'save')
        .mockResolvedValue(entity as any);

      expect(await service.create(createCustomFieldDto)).toStrictEqual(entity);
      expect(
        (customFieldsRepository.save as jest.Mock<any>).mock.calls[0][0],
      ).toEqual(entity);
    });

    it(`should return the created customField`, async () => {
      const createCustomFieldDto: CreateCustomFieldDto = {
        name: `Phase`,
      };
      const entity = {
        name: createCustomFieldDto.name,
        values: [],
      };

      jest
        .spyOn(customFieldsRepository, 'save')
        .mockResolvedValue(entity as any);

      expect(await service.create(createCustomFieldDto)).toStrictEqual(entity);

      delete entity.values;

      expect(
        (customFieldsRepository.save as jest.Mock<any>).mock.calls[0][0],
      ).toEqual(entity);
    });

    it(`should throw DuplicatedCustomFieldException`, () => {
      const error: any = new QueryFailedError('lorem', [], {});

      error.errno = ER_DUP_ENTRY;

      jest.spyOn(customFieldsRepository, 'save').mockRejectedValue(error);

      return expect(service.create({} as CreateCustomFieldDto)).rejects.toThrow(
        DuplicatedCustomFieldException,
      );
    });
  });

  describe(`update(customFieldId: number, updateCustomFieldDto: UpdateCustomFieldDto)`, () => {
    it(`should return the updated customField`, async () => {
      const updateCustomFieldDto: UpdateCustomFieldDto = { values: ['ok'] };
      const updatedCustomField: CustomField = {} as CustomField;
      const entity = {
        values: updateCustomFieldDto.values.map(v => ({ value: v })),
      };

      jest
        .spyOn(customFieldsRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(customFieldsRepository, 'findOne')
        .mockResolvedValue(updatedCustomField);

      expect(await service.update(1, updateCustomFieldDto)).toEqual(
        updatedCustomField,
      );
      expect(
        (customFieldsRepository.update as jest.Mock<any>).mock.calls[0][1],
      ).toEqual(entity);
    });

    it(`should throw the CustomFieldNotFoundException if a customField with the given customField id could not be found (no upsert)`, () => {
      jest
        .spyOn(customFieldsRepository, 'update')
        .mockResolvedValue({ affected: 0 } as any);

      return expect(
        service.update(1, {} as UpdateCustomFieldDto),
      ).rejects.toThrow(CustomFieldNotFoundException);
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
