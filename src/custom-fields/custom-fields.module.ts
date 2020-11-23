import { Module } from '@nestjs/common';
import { CustomFieldsService } from './custom-fields.service';
import { CustomFieldsController } from './custom-fields.controller';

@Module({
  controllers: [CustomFieldsController],
  providers: [CustomFieldsService]
})
export class CustomFieldsModule {}
