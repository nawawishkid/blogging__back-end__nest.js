import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomField } from './custom-field.entity';

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
}
