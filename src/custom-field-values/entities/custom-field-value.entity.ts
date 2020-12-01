import { BlogCustomField } from '../../blogs/entities/blog-custom-field.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomField } from '../../custom-fields/entities/custom-field.entity';

@Entity()
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
