import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldValuesController } from './custom-field-values.controller';
import { CustomFieldValuesService } from './custom-field-values.service';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';
import { DuplicatedCustomFieldValueException } from './exceptions/duplicated-custom-field-value.exception';

describe('CustomFieldValuesController', () => {
  let controller: CustomFieldValuesController,
    service: CustomFieldValuesService;

  beforeEach(async () => {
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFieldValuesController],
      providers: [
        {
          provide: CustomFieldValuesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CustomFieldValuesController>(
      CustomFieldValuesController,
    );
    service = module.get<CustomFieldValuesService>(CustomFieldValuesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`findAll()`, () => {
    it(`should return { customFieldValues }`, () => {
      const customFieldValues = [{}, {}] as CustomFieldValue[];

      jest.spyOn(service, 'findAll').mockResolvedValue(customFieldValues);

      return expect(controller.findAll()).resolves.toEqual({
        customFieldValues,
      });
    });

    it(`should throw NotFoundException`, () => {
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      return expect(controller.findAll()).rejects.toThrow(NotFoundException);
    });
  });

  describe(`findOne(id: string)`, () => {
    it(`should return { customFieldValue }`, () => {
      const customFieldValue = {} as CustomFieldValue;

      jest.spyOn(service, 'findOne').mockResolvedValue(customFieldValue);

      return expect(controller.findOne('1')).resolves.toEqual({
        customFieldValue,
      });
    });

    it(`should throw NotFoundException`, () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(undefined);

      return expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe(`update(id: string, updateCustomFieldValueDto: UpdateCustomFieldValueDto)`, () => {
    it(`should return { updatedCustomFieldValue }`, () => {
      const updatedCustomFieldValue = {} as CustomFieldValue;

      jest.spyOn(service, 'update').mockResolvedValue(updatedCustomFieldValue);

      return expect(
        controller.update('1', {} as UpdateCustomFieldValueDto),
      ).resolves.toEqual({ updatedCustomFieldValue });
    });

    it(`should throw NotFoundException`, () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new CustomFieldValueNotFoundException());

      return expect(
        controller.update('1', {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(NotFoundException);
    });

    it(`should throw ConflictException`, () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new DuplicatedCustomFieldValueException());

      return expect(
        controller.update('1', {} as UpdateCustomFieldValueDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe(`remove(id: string)`, () => {
    it(`should return nothing`, () => {
      const id = '1';

      jest.spyOn(service, 'remove').mockResolvedValue(+id);

      return expect(controller.remove(id)).resolves.toBeUndefined();
    });

    it(`should throw NotFoundException`, () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new CustomFieldValueNotFoundException());

      return expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
