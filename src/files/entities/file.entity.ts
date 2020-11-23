import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class File {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  path: string;

  @Column()
  type: string;

  @Column('int')
  size: number;

  @Column('varchar', { nullable: true, unique: true })
  name?: string;
}
