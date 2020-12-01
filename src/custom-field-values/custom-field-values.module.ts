import { Module } from '@nestjs/common';
import { CustomFieldValuesService } from './custom-field-values.service';
import { CustomFieldValuesController } from './custom-field-values.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomFieldValue } from './entities/custom-field-value.entity';

const customFieldValueRepository = TypeOrmModule.forFeature([CustomFieldValue]);

@Module({
  imports: [customFieldValueRepository],
  controllers: [CustomFieldValuesController],
  providers: [CustomFieldValuesService],
  exports: [CustomFieldValuesService, customFieldValueRepository],
})
export class CustomFieldValuesModule {}
