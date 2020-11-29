import { CustomFieldValue } from 'src/custom-fields/entities/custom-field-value.entity';
import { CustomField } from 'src/custom-fields/entities/custom-field.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class BlogCustomField {
  @PrimaryColumn('uuid')
  blogId: string;

  @PrimaryColumn('int')
  customFieldId: number;

  @PrimaryColumn('int')
  customFieldValueId: number;

  @ManyToOne(
    () => Blog,
    blog => blog.blogCustomFields,
  )
  blog: Blog;

  @ManyToOne(
    () => CustomField,
    cf => cf.blogCustomFields,
  )
  customField: CustomField;

  @ManyToOne(
    () => CustomFieldValue,
    cfv => cfv.blogCustomFields,
  )
  customFieldValue: CustomFieldValue;
}
