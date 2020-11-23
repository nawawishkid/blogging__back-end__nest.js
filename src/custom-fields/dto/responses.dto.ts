import { CustomFieldValue } from '../entities/custom-field-value.entity';
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

export class CreateCustomFieldValueResponseDto {
  createdCustomFieldValue: CustomFieldValue;
}

export class UpdateCustomFieldValueResponseDto {
  updatedCustomFieldValue: CustomFieldValue;
}

export class FindAllCustomFieldValueResponseDto {
  customFieldValues: CustomFieldValue[];
}

export class FindOneCustomFieldValueResponseDto {
  customFieldValue: CustomFieldValue;
}
