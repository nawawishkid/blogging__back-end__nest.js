import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldsController } from './custom-fields.controller';
import { CustomFieldsService } from './custom-fields.service';

describe('CustomFieldsController', () => {
  let controller: CustomFieldsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomFieldsController],
      providers: [CustomFieldsService],
    }).compile();

    controller = module.get<CustomFieldsController>(CustomFieldsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
