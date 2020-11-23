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
} from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CreateCustomFieldDto } from './dto/create-custom-field.dto';
import {
  CreateCustomFieldResponseDto,
  FindAllCustomFieldResponseDto,
  FindOneCustomFieldResponseDto,
  UpdateCustomFieldResponseDto,
} from './dto/responses.dto';
import { UpdateCustomFieldDto } from './dto/update-custom-field.dto';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldNotFoundException } from './exceptions/custom-field-not-found.exception';

@Controller('custom-fields')
export class CustomFieldsController {
  constructor(private readonly customFieldsService: CustomFieldsService) {}

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
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.customFieldsService.remove(+id);
    } catch (e) {
      if (e instanceof CustomFieldNotFoundException)
        throw new NotFoundException();

      throw new InternalServerErrorException();
    }
  }
}
