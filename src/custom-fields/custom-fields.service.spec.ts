import { Test, TestingModule } from '@nestjs/testing';
import { CustomFieldsService } from './custom-fields.service';

describe('CustomFieldsService', () => {
  let service: CustomFieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomFieldsService],
    }).compile();

    service = module.get<CustomFieldsService>(CustomFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
