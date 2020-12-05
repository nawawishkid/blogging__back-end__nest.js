import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth.guard';
import { CustomFieldValuesService } from './custom-field-values.service';
import {
  FindAllCustomFieldValuesResponseDto,
  FindOneCustomFieldValueResponseDto,
  UpdateCustomFieldValueResponseDto,
} from './dto/response.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';
import { DuplicatedCustomFieldValueException } from './exceptions/duplicated-custom-field-value.exception';

@UseGuards(AuthGuard)
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
        throw new NotFoundException(e);

      if (e instanceof DuplicatedCustomFieldValueException)
        throw new ConflictException(e);

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
