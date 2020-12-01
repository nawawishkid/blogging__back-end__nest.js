import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  NotFoundException,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';
import {
  CreateCustomFieldResponseDto,
  FindAllCustomFieldsResponseDto,
  FindOneCustomFieldResponseDto,
  UpdateCustomFieldResponseDto,
} from './dto/response.dto';
import { CreateCustomFieldValueDto } from '../custom-field-values/dto/create-custom-field-value.dto';
import { CreateCustomFieldValueResponseDto } from '../custom-field-values/dto/response.dto';
import { CustomFieldValuesService } from '../custom-field-values/custom-field-values.service';
import { CustomFieldValue } from '../custom-field-values/entities/custom-field-value.entity';
import { AuthGuard } from '../auth.guard';

@UseGuards(AuthGuard)
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
  async findAll(): Promise<FindAllCustomFieldsResponseDto> {
    const customFields: CustomField[] = await this.customFieldsService.findAll();

    if (customFields.length === 0) throw new NotFoundException();

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

      throw new e();
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

      throw new e();
    }
  }

  /**
   * CustomFieldValue
   */
  @Post(`:customFieldId/values`)
  async createCustomFieldValue(
    @Param(`customFieldId`) customFieldId: string,
    @Body() createCustomFieldValueDto: CreateCustomFieldValueDto,
  ): Promise<CreateCustomFieldValueResponseDto> {
    const createdCustomFieldValue: CustomFieldValue = await this.customFieldValuesService.create(
      {
        customFieldId,
        ...createCustomFieldValueDto,
      },
    );

    return { createdCustomFieldValue };
  }
}
