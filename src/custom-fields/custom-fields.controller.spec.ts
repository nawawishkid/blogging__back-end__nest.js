import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldValue } from '../custom-field-values/entities/custom-field-value.entity';
import { DuplicatedCustomFieldValueException } from '../custom-field-values/exceptions/duplicated-custom-field-value.exception';
import { CustomFieldValuesService } from '../custom-field-values/custom-field-values.service';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldValueRequestBodyDto } from './dto/create-custom-field-value-request-body.dto';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';
import { DuplicatedCustomFieldException } from './exceptions/duplicated-custom-field.exception';

describe('CustomFieldsController', () => {
  let controller: CustomFieldsController,
    customFieldsService: CustomFieldsService,
    customFieldValuesService: CustomFieldValuesService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFieldsController],
      providers: [
        {
          provide: CustomFieldsService,
          useValue: {
            findOne: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: CustomFieldValuesService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomFieldsController>(CustomFieldsController);
    customFieldsService = module.get<CustomFieldsService>(CustomFieldsService);
    customFieldValuesService = module.get<CustomFieldValuesService>(
      CustomFieldValuesService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`findAll()`, () => {
    it(`should return all customFields`, () => {
      const foundCustomFields: CustomField[] = [{}, {}] as CustomField[];

      jest
        .spyOn(customFieldsService, 'findAll')
        .mockResolvedValue(foundCustomFields as any);

      return expect(controller.findAll()).resolves.toEqual({
        customFields: foundCustomFields,
      });
    });

    it(`should throw the NotFoundException if there's no customField`, () => {
      jest.spyOn(customFieldsService, 'findAll').mockResolvedValue([]);

      return expect(controller.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe(`findOne(customFieldId: number)`, () => {
    it(`should return a customField with the given id`, () => {
      const foundCustomField: CustomField = {} as CustomField;

      jest
        .spyOn(customFieldsService, 'findOne')
        .mockResolvedValue(foundCustomField as any);

      return expect(controller.findOne('1')).resolves.toEqual({
        customField: foundCustomField,
      });
    });

    it(`should throw the NotFoundException if a customField with the given customField id could not be found`, () => {
      jest.spyOn(customFieldsService, 'findOne').mockResolvedValue(undefined);

      return expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe(`create(createCustomFieldDto: CreateCustomFieldDto)`, () => {
    it(`should return the created customField`, () => {
      const createdCustomField: CustomField = {} as CustomField;

      jest
        .spyOn(customFieldsService, 'create')
        .mockResolvedValue(createdCustomField as any);

      return expect(
        controller.create({} as CreateCustomFieldDto),
      ).resolves.toEqual({
        createdCustomField,
      });
    });

    it(`should throw ConflictException on duplicated custom field name`, () => {
      jest
        .spyOn(customFieldsService, 'create')
        .mockRejectedValue(new DuplicatedCustomFieldException());

      return expect(
        controller.create({} as CreateCustomFieldDto),
      ).rejects.toThrow(ConflictException);
    });

    it(`should throw what is thrown by the service`, () => {
      jest.spyOn(customFieldsService, 'create').mockRejectedValue(new Error());

      return expect(
        controller.create({} as CreateCustomFieldDto),
      ).rejects.toThrow(Error);
    });
  });

  describe(`update(customFieldId: number, updateCustomFieldDto: UpdateCustomFieldDto)`, () => {
    it(`should return the updated customField`, () => {
      const updatedCustomField: CustomField = {} as CustomField;

      jest
        .spyOn(customFieldsService, 'update')
        .mockResolvedValue(updatedCustomField as any);

      return expect(
        controller.update('1', {} as UpdateCustomFieldDto),
      ).resolves.toEqual({ updatedCustomField });
    });

    it(`should throw the NotFoundException if a customField with the given id could not be found to update (no upsert)`, () => {
      jest
        .spyOn(customFieldsService, 'update')
        .mockRejectedValue(new CustomFieldNotFoundException());

      return expect(
        controller.update('1', {} as UpdateCustomFieldDto),
      ).rejects.toThrow(NotFoundException);
    });

    it(`should throw ConflictException on duplicated custom field name`, () => {
      jest
        .spyOn(customFieldsService, 'update')
        .mockRejectedValue(new DuplicatedCustomFieldException());

      return expect(
        controller.update('1', {} as UpdateCustomFieldDto),
      ).rejects.toThrow(ConflictException);
    });

    it(`should throw what is thrown by the service`, () => {
      jest.spyOn(customFieldsService, 'update').mockRejectedValue(new Error());

      return expect(
        controller.update('1', {} as UpdateCustomFieldDto),
      ).rejects.toThrow(Error);
    });
  });

  describe(`remove(customFieldId: number)`, () => {
    it(`should return nothing if successfully removed`, () => {
      const customFieldId = '1';

      jest
        .spyOn(customFieldsService, 'remove')
        .mockResolvedValue(+customFieldId);

      return expect(controller.remove(customFieldId)).resolves.toBeUndefined();
    });

    it(`should throw the NotFoundException if a customField with the given id could not be found to remove`, () => {
      jest
        .spyOn(customFieldsService, 'remove')
        .mockRejectedValue(new CustomFieldNotFoundException());

      return expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });

    it(`should throw what is thrown by the service`, () => {
      const error = new Error();

      jest.spyOn(customFieldsService, 'remove').mockRejectedValue(error);

      return expect(controller.remove('1')).rejects.toThrow(error);
    });
  });

  describe(`createCustomFieldValue()`, () => {
    it(`should return created custom field`, () => {
      const createdCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesService, 'create')
        .mockResolvedValue(createdCustomFieldValue);

      return expect(
        controller.createCustomFieldValue(
          '1',
          {} as CreateCustomFieldValueRequestBodyDto,
        ),
      ).resolves.toEqual({ createdCustomFieldValue });
    });

    it(`should throw ConflictException`, () => {
      jest
        .spyOn(customFieldValuesService, 'create')
        .mockRejectedValue(new DuplicatedCustomFieldValueException());

      return expect(
        controller.createCustomFieldValue(
          '1',
          {} as CreateCustomFieldValueRequestBodyDto,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it(`should throw BadRequestException on receiving unknown custom field id`, () => {
      jest
        .spyOn(customFieldValuesService, 'create')
        .mockRejectedValue(new CustomFieldNotFoundException());

      return expect(
        controller.createCustomFieldValue(
          '1',
          {} as CreateCustomFieldValueRequestBodyDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it(`should throw what is thrown by the service`, () => {
      const error = new Error();

      jest.spyOn(customFieldValuesService, 'create').mockRejectedValue(error);

      return expect(
        controller.createCustomFieldValue(
          '1',
          {} as CreateCustomFieldValueRequestBodyDto,
        ),
      ).rejects.toThrow(error);
    });
  });
});
