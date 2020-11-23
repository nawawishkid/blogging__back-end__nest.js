import { Module } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldValuesService } from './custom-field-values.service';

@Module({
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService, CustomFieldValuesService],
})
export class CustomFieldsModule {}
