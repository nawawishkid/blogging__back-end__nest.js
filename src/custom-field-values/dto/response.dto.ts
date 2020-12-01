import { CustomFieldValue } from '../entities/custom-field-value.entity';

export class CreateCustomFieldValueResponseDto {
  createdCustomFieldValue: CustomFieldValue;
}

export class UpdateCustomFieldValueResponseDto {
  updatedCustomFieldValue: CustomFieldValue;
}

export class FindAllCustomFieldValuesResponseDto {
  customFieldValues: CustomFieldValue[];
}

export class FindOneCustomFieldValueResponseDto {
  customFieldValue: CustomFieldValue;
}
