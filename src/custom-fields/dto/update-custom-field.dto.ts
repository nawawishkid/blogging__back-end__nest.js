import {
  IsArray,
  isNotEmptyObject,
  IsString,
  ValidateIf,
} from 'class-validator';

/**
 * Not allow empty object
 */
const condition = o => !isNotEmptyObject(o);
const option = {
  message: `The DTO must not be an empty object. All fields are optional but at least 1 field is required`,
};

export class UpdateCustomFieldDto {
  @ValidateIf(condition, option)
  @IsString()
  name?: string;

  @ValidateIf(condition, option)
  @IsString()
  description?: string;

  @ValidateIf(condition, option)
  @IsArray()
  values?: string[];
}
