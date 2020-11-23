import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldValuesService } from './custom-field-values.service';
import { CreateCustomFieldValueDto } from './dto/create-custom-field-value.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';
import { CustomFieldsService } from './custom-fields.service';

describe('CustomFieldValuesController', () => {
  let controller: CustomFieldsController,
    customFieldValuesService: CustomFieldValuesService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFieldsController],
      providers: [
        { provide: CustomFieldsService, useValue: {} },
        {
          provide: CustomFieldValuesService,
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

    controller = module.get<CustomFieldsController>(CustomFieldsController);
    customFieldValuesService = module.get<CustomFieldValuesService>(
      CustomFieldValuesService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`findAllCustomFieldValues()`, () => {
    it(`should return all customFieldValues`, () => {
      const foundCustomFieldValues: CustomFieldValue[] = [
        {},
        {},
      ] as CustomFieldValue[];

      jest
        .spyOn(customFieldValuesService, 'findAll')
        .mockResolvedValue(foundCustomFieldValues as any);

      return expect(controller.findAllCustomFieldValues()).resolves.toEqual({
        customFieldValues: foundCustomFieldValues,
      });
    });

    it(`should throw the NotFoundException if there's no customFieldValue`, () => {
      jest
        .spyOn(customFieldValuesService, 'findAll')
        .mockResolvedValue(undefined);

      return expect(controller.findAllCustomFieldValues()).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe(`findOneCustomFieldValue(customFieldValueId: number)`, () => {
    it(`should return a customFieldValue with the given id`, () => {
      const foundCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesService, 'findOne')
        .mockResolvedValue(foundCustomFieldValue as any);

      return expect(controller.findOneCustomFieldValue('1')).resolves.toEqual({
        customFieldValue: foundCustomFieldValue,
      });
    });

    it(`should throw the NotFoundException if a customFieldValue with the given customFieldValue id could not be found`, () => {
      jest
        .spyOn(customFieldValuesService, 'findOne')
        .mockResolvedValue(undefined);

      return expect(controller.findOneCustomFieldValue('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe(`createCustomFieldValue(createCustomFieldValueDto: CreateCustomFieldValueDto)`, () => {
    it(`should return the created customFieldValue`, () => {
      const createdCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesService, 'create')
        .mockResolvedValue(createdCustomFieldValue as any);

      return expect(
        controller.createCustomFieldValue({} as CreateCustomFieldValueDto),
      ).resolves.toEqual({
        createdCustomFieldValue,
      });
    });
  });

  describe(`updateCustomFieldValue(customFieldValueId: number, updateCustomFieldValueDto: UpdateCustomFieldValueDto)`, () => {
    it(`should return the updated customFieldValue`, () => {
      const updatedCustomFieldValue: CustomFieldValue = {} as CustomFieldValue;

      jest
        .spyOn(customFieldValuesService, 'update')
        .mockResolvedValue(updatedCustomFieldValue as any);

      return expect(
        controller.updateCustomFieldValue('1', {} as UpdateCustomFieldValueDto),
      ).resolves.toEqual({ updatedCustomFieldValue });
    });

    it(`should throw the NotFoundException if a customFieldValue with the given id could not be found to update (no upsert)`, () => {
      jest
        .spyOn(customFieldValuesService, 'update')
        .mockRejectedValue(new CustomFieldValueNotFoundException());

      return expect(
        controller.updateCustomFieldValue('1', {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(NotFoundException);
    });

    it(`should throw the InternalServerErrorException if there is another error thrown by customFieldValuesService`, () => {
      jest
        .spyOn(customFieldValuesService, 'update')
        .mockRejectedValue(new Error());

      return expect(
        controller.updateCustomFieldValue('1', {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe(`removeCustomFieldValue(customFieldValueId: number)`, () => {
    it(`should return nothing if successfully removed`, () => {
      const customFieldValueId = '1';

      jest
        .spyOn(customFieldValuesService, 'remove')
        .mockResolvedValue(+customFieldValueId);

      return expect(
        controller.removeCustomFieldValue(customFieldValueId),
      ).resolves.toBeUndefined();
    });

    it(`should throw the NotFoundException if a customFieldValue with the given id could not be found to remove`, () => {
      jest
        .spyOn(customFieldValuesService, 'remove')
        .mockRejectedValue(new CustomFieldValueNotFoundException());

      return expect(controller.removeCustomFieldValue('1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it(`should throw the InternalServerErrorException if there is another error thrown by customFieldValuesService`, () => {
      jest
        .spyOn(customFieldValuesService, 'remove')
        .mockRejectedValue(new Error());

      return expect(controller.removeCustomFieldValue('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
