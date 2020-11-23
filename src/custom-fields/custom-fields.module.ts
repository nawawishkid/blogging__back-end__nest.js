import { Module } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldValuesService } from './custom-field-values.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomField } from './entities/custom-field.entity';
import { CustomFieldValue } from './entities/custom-field-value.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomField, CustomFieldValue])],
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService, CustomFieldValuesService],
})
export class CustomFieldsModule {}
