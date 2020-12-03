import { ER_DUP_ENTRY } from 'mysql/lib/protocol/constants/errors';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeleteResult,
  QueryFailedError,
  Repository,
  UpdateResult,
} from 'typeorm';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomFieldValue } from '../custom-field-values/entities/custom-field-value.entity';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';
import { DuplicatedCustomFieldException } from './exceptions/duplicated-custom-field.exception';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomField)
    private customFieldsRepository: Repository<CustomField>,
  ) {}

  async create(
    createCustomFieldDto: CreateCustomFieldDto,
  ): Promise<CustomField> {
    try {
      const createdCustomField: CustomField = await this.customFieldsRepository.save(
        createCustomFieldDto,
      );

      return this.findOne(createdCustomField.id);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).errno === ER_DUP_ENTRY)
        throw new DuplicatedCustomFieldException();

      throw e;
    }
  }

  findAll(): Promise<CustomField[]> {
    return this.customFieldsRepository.find({
      relations: ['values'],
    });
  }

  findOne(id: number): Promise<CustomField> {
    return this.customFieldsRepository.findOne(id, {
      relations: ['values'],
    });
  }

  async update(
    id: number,
    updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<CustomField> {
    const updateResult: UpdateResult = await this.customFieldsRepository.update(
      id,
      updateCustomFieldDto,
    );

    if (updateResult.affected === 0) throw new CustomFieldNotFoundException();

    return this.findOne(id);
  }

  async remove(id: number): Promise<number> {
    const deleteResult: DeleteResult = await this.customFieldsRepository.delete(
      id,
    );

    if (deleteResult.affected === 0) throw new CustomFieldNotFoundException();

    return id;
  }
}
