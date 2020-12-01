import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomFieldValueDto } from './create-custom-field-value.dto';

export class UpdateCustomFieldValueDto extends PartialType(CreateCustomFieldValueDto) {}
