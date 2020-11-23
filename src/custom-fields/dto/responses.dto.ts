import { CustomField } from '../entities/custom-field.entity';

export class CreateCustomFieldResponseDto {
  createdCustomField: CustomField;
}

export class UpdateCustomFieldResponseDto {
  updatedCustomField: CustomField;
}

export class FindAllCustomFieldResponseDto {
  customFields: CustomField[];
}

export class FindOneCustomFieldResponseDto {
  customField: CustomField;
}
