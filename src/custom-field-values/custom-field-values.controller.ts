import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common';
import { CustomFieldValuesService } from './custom-field-values.service';
import {
  FindAllCustomFieldValuesResponseDto,
  FindOneCustomFieldValueResponseDto,
  UpdateCustomFieldValueResponseDto,
} from './dto/response.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';

@Controller('custom-field-values')
export class CustomFieldValuesController {
  constructor(
    private readonly customFieldValuesService: CustomFieldValuesService,
  ) {}

  @Get()
  async findAll(): Promise<FindAllCustomFieldValuesResponseDto> {
    const customFieldValues: CustomFieldValue[] = await this.customFieldValuesService.findAll();

    if (customFieldValues.length === 0) throw new NotFoundException();

    return { customFieldValues };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<FindOneCustomFieldValueResponseDto> {
    const customFieldValue = await this.customFieldValuesService.findOne(+id);

    if (!customFieldValue) throw new NotFoundException();

    return { customFieldValue };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomFieldValueDto: UpdateCustomFieldValueDto,
  ): Promise<UpdateCustomFieldValueResponseDto> {
    try {
      const updatedCustomFieldValue: CustomFieldValue = await this.customFieldValuesService.update(
        +id,
        updateCustomFieldValueDto,
      );

      return { updatedCustomFieldValue };
    } catch (e) {
      if (e instanceof CustomFieldValueNotFoundException)
        throw new NotFoundException();

      throw e;
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.customFieldValuesService.remove(+id);
    } catch (e) {
      if (e instanceof CustomFieldValueNotFoundException)
        throw new NotFoundException();

      throw e;
    }
  }
}
