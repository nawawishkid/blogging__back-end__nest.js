import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomFieldValue } from '../custom-field-values/entities/custom-field-value.entity';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomField)
    private customFieldsRepository: Repository<CustomField>,
  ) {}

  create(createCustomFieldDto: CreateCustomFieldDto): Promise<CustomField> {
    const { values, ...cf } = createCustomFieldDto;
    const customField: CustomField = new CustomField();
    let cfvs: CustomFieldValue[];

    Object.assign(customField, cf);

    if (Array.isArray(values)) {
      cfvs = values.map(v => {
        const cfv = new CustomFieldValue();
        cfv.value = v;
        return cfv;
      });

      customField.values = cfvs;
    }

    return this.customFieldsRepository.save(customField);
  }

  findAll(): Promise<CustomField[]> {
    return this.customFieldsRepository.find({
      relations: ['custom_field_value'],
    });
  }

  findOne(id: number): Promise<CustomField> {
    return this.customFieldsRepository.findOne(id, {
      relations: ['custom_field_value'],
    });
  }

  async update(
    id: number,
    updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<CustomField> {
    const { values, ...cf } = updateCustomFieldDto;
    const customField: CustomField = new CustomField();
    let cfvs: CustomFieldValue[];

    Object.assign(customField, cf);

    if (Array.isArray(values)) {
      cfvs = values.map(v => {
        const cfv = new CustomFieldValue();
        cfv.value = v;
        return cfv;
      });

      customField.values = cfvs;
    }

    const updateResult: UpdateResult = await this.customFieldsRepository.update(
      id,
      customField,
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
