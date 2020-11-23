import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CustomFieldValue } from './custom-field-value.entity';

@Entity()
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
