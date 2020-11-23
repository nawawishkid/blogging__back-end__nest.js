import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  path: string;

  @Column()
  type: string;

  @Column('int')
  size: number;
}
