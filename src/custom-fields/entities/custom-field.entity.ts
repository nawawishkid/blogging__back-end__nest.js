import { Column, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomFieldValue } from './custom-field-value.entity';

export class CustomField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @OneToMany(
    () => CustomFieldValue,
    customFieldValue => customFieldValue.customField,
  )
  values: CustomFieldValue[];
}
