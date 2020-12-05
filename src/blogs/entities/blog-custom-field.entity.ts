import { CustomFieldValue } from '../../custom-field-values/entities/custom-field-value.entity';
import { Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
@Unique([`blogId`, `customFieldValueId`])
export class BlogCustomField {
  @PrimaryColumn('uuid')
  blogId: string;

  @PrimaryColumn('int')
  customFieldValueId: number;

  @ManyToOne(
    () => Blog,
    blog => blog.blogCustomFields,
    { onDelete: 'CASCADE' },
  )
  blog?: Blog;

  @ManyToOne(
    () => CustomFieldValue,
    cfv => cfv.blogCustomFields,
    { onDelete: 'CASCADE' },
  )
  customFieldValue?: CustomFieldValue;
}
