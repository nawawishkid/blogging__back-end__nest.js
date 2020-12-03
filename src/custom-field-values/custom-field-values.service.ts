import { ER_DUP_ENTRY } from 'mysql/lib/protocol/constants/errors';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateCustomFieldValueDto } from './dto/create-custom-field-value.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';
import { DuplicatedCustomFieldValueException } from './exceptions/duplicated-custom-field-value.exception';

@Injectable()
export class CustomFieldValuesService {
  constructor(
    @InjectRepository(CustomFieldValue)
    private readonly customFieldValuesRepository: Repository<CustomFieldValue>,
  ) {}

  async create(
    createCustomFieldValueDto: CreateCustomFieldValueDto,
  ): Promise<CustomFieldValue> {
    try {
      return await this.customFieldValuesRepository.save(
        createCustomFieldValueDto,
      );
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).errno === ER_DUP_ENTRY)
        throw new DuplicatedCustomFieldValueException();

      throw e;
    }
  }

  findAll(): Promise<CustomFieldValue[]> {
    return this.customFieldValuesRepository.find();
  }

  findOne(id: number): Promise<CustomFieldValue> {
    return this.customFieldValuesRepository.findOne(id);
  }

  async update(
    id: number,
    updateCustomFieldValueDto: UpdateCustomFieldValueDto,
  ): Promise<CustomFieldValue> {
    try {
      const updateResult: UpdateResult = await this.customFieldValuesRepository.update(
        id,
        updateCustomFieldValueDto,
      );

      if (updateResult.affected === 0)
        throw new CustomFieldValueNotFoundException();

      return this.findOne(id);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).errno === ER_DUP_ENTRY)
        throw new DuplicatedCustomFieldValueException();

      throw e;
    }
  }

  async remove(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.customFieldValuesRepository.delete(
      id,
    );

    if (deleteResult.affected === 0)
      throw new CustomFieldValueNotFoundException();

    return id;
  }
}
