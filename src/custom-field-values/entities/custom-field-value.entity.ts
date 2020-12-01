import { BlogCustomField } from '../../blogs/entities/blog-custom-field.entity';
import {
  Column,
  Entity,
  JoinColumn,
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
  )
  @JoinColumn({ name: 'customFieldId' })
  customField: CustomField;

  @Column()
  value: string;

  @Column('text', { nullable: true })
  description?: string;

  @OneToMany(
    () => BlogCustomField,
    bcf => bcf.customFieldValue,
  )
  blogCustomFields: BlogCustomField[];
}
