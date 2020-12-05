import { PartialType } from '@nestjs/mapped-types';
import { CreateBlogRequestBodyDto } from './create-blog-request-body.dto';

export class UpdateBlogRequestBodyDto extends PartialType(
  CreateBlogRequestBodyDto,
) {}
