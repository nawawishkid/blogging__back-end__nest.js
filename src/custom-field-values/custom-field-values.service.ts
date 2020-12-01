import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateCustomFieldValueDto } from './dto/create-custom-field-value.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';

@Injectable()
export class CustomFieldValuesService {
  constructor(
    @InjectRepository(CustomFieldValue)
    private readonly customFieldValuesRepository: Repository<CustomFieldValue>,
  ) {}

  create(
    createCustomFieldValueDto: CreateCustomFieldValueDto,
  ): Promise<CustomFieldValue> {
    return this.customFieldValuesRepository.save(createCustomFieldValueDto);
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
    const updateResult: UpdateResult = await this.customFieldValuesRepository.update(
      id,
      updateCustomFieldValueDto,
    );

    if (updateResult.affected === 0)
      throw new CustomFieldValueNotFoundException();

    return this.findOne(id);
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
