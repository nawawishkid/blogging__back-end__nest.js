import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class CustomField {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description?: string;
}
