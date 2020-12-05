import { BlogCustomField } from '../../blogs/entities/blog-custom-field.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { CustomField } from '../../custom-fields/entities/custom-field.entity';

@Entity()
@Unique([`customFieldId`, `value`])
export class CustomFieldValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customFieldId: number;

  @ManyToOne(
    () => CustomField,
    customField => customField.values,
    { onDelete: 'CASCADE' },
  )
  customField?: CustomField;

  @Column()
  value: string;

  @Column('text', { nullable: true })
  description?: string;

  @OneToMany(
    () => BlogCustomField,
    bcf => bcf.customFieldValue,
  )
  blogCustomFields?: BlogCustomField[];
}
