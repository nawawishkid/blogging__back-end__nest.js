import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';

@Injectable()
export class CustomFieldsService {
  constructor(
    @InjectRepository(CustomField)
    private customFieldsRepository: Repository<CustomField>,
  ) {}

  create(createCustomFieldDto: CreateCustomFieldDto): Promise<CustomField> {
    return this.customFieldsRepository.save(createCustomFieldDto);
  }

  findAll(): Promise<CustomField[]> {
    return this.customFieldsRepository.find();
  }

  findOne(id: number): Promise<CustomField> {
    return this.customFieldsRepository.findOne(id);
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
