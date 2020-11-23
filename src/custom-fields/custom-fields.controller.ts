import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  InternalServerErrorException,
  HttpCode,
} from '@nestjs/common';
import { CustomFieldValuesService } from './custom-field-values.service';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldValueDto } from './dto/create-custom-field-value.dto';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import {
  CreateCustomFieldResponseDto,
  CreateCustomFieldValueResponseDto,
  FindAllCustomFieldResponseDto,
  FindAllCustomFieldValueResponseDto,
  FindOneCustomFieldResponseDto,
  FindOneCustomFieldValueResponseDto,
  UpdateCustomFieldResponseDto,
  UpdateCustomFieldValueResponseDto,
} from './dto/responses.dto';
import { UpdateCustomFieldValueDto } from './dto/update-custom-field-value.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomFieldValue } from './entities/custom-field-value.entity';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';
import { CustomFieldValueNotFoundException } from './exceptions/custom-field-value-not-found.exception';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(
    private readonly customFieldsService: CustomFieldsService,
    private readonly customFieldValuesService: CustomFieldValuesService,
  ) {}

  @Post()
  async create(
    @Body() createCustomFieldDto: CreateCustomFieldDto,
  ): Promise<CreateCustomFieldResponseDto> {
    const createdCustomField: CustomField = await this.customFieldsService.create(
      createCustomFieldDto,
    );

    return { createdCustomField };
  }

  @Get()
  async findAll(): Promise<FindAllCustomFieldResponseDto> {
    const customFields: CustomField[] = await this.customFieldsService.findAll();

    if (!customFields) throw new NotFoundException();

    return { customFields };
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
  ): Promise<FindOneCustomFieldResponseDto> {
    const customField = await this.customFieldsService.findOne(+id);

    if (!customField) throw new NotFoundException();

    return { customField };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomFieldDto: UpdateCustomFieldDto,
  ): Promise<UpdateCustomFieldResponseDto> {
    try {
      const updatedCustomField: CustomField = await this.customFieldsService.update(
        +id,
        updateCustomFieldDto,
      );

      return { updatedCustomField };
    } catch (e) {
      if (e instanceof CustomFieldNotFoundException)
        throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.customFieldsService.remove(+id);
    } catch (e) {
      if (e instanceof CustomFieldNotFoundException)
        throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }

  /**
   * CustomFieldValue
   */
  @Post()
  async createCustomFieldValue(
    @Body() createCustomFieldValueDto: CreateCustomFieldValueDto,
  ): Promise<CreateCustomFieldValueResponseDto> {
    const createdCustomFieldValue: CustomFieldValue = await this.customFieldValuesService.create(
      createCustomFieldValueDto,
    );

    return { createdCustomFieldValue };
  }

  @Get()
  async findAllCustomFieldValues(): Promise<
    FindAllCustomFieldValueResponseDto
  > {
    const customFieldValues: CustomFieldValue[] = await this.customFieldValuesService.findAll();

    if (!customFieldValues) throw new NotFoundException();

    return { customFieldValues };
  }

  @Get(':id')
  async findOneCustomFieldValue(
    @Param('id') id: string,
  ): Promise<FindOneCustomFieldValueResponseDto> {
    const customFieldValue = await this.customFieldValuesService.findOne(+id);

    if (!customFieldValue) throw new NotFoundException();

    return { customFieldValue };
  }

  @Put(':id')
  async updateCustomFieldValue(
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

      throw new InternalServerErrorException();
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async removeCustomFieldValue(@Param('id') id: string): Promise<void> {
    try {
      await this.customFieldValuesService.remove(+id);
    } catch (e) {
      if (e instanceof CustomFieldValueNotFoundException)
        throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }
}
