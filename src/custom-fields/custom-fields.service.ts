import { Injectable } from '@nestjs/common';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';

@Injectable()
export class CustomFieldsService {
  create(createCustomFieldDto: CreateCustomFieldDto) {
    return 'This action adds a new customField';
  }

  findAll() {
    return `This action returns all customFields`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customField`;
  }

  update(id: number, updateCustomFieldDto: UpdateCustomFieldDto) {
    return `This action updates a #${id} customField`;
  }

  remove(id: number) {
    return `This action removes a #${id} customField`;
  }
}
