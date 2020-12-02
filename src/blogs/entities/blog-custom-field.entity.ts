import { CustomFieldValue } from '../../custom-field-values/entities/custom-field-value.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class BlogCustomField {
  @PrimaryColumn('uuid')
  blogId: string;

  @PrimaryColumn('int')
  customFieldValueId: number;

  @ManyToOne(
    () => Blog,
    blog => blog.blogCustomFields,
  )
  blog?: Blog;

  @ManyToOne(
    () => CustomFieldValue,
    cfv => cfv.blogCustomFields,
  )
  customFieldValue?: CustomFieldValue;
}
