import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BlogCustomField } from './blog-custom-field.entity';

@Entity()
export class Blog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  title: string;

  @Column('text', { nullable: true })
  body?: string;

  @Column('text', { nullable: true })
  coverImage: string;

  @Column('text', { nullable: true })
  excerpt?: string;

  @Column('int')
  authorId: number;

  @ManyToOne(
    () => User,
    user => user.blogs,
    { onDelete: 'NO ACTION' },
  )
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column({ nullable: true })
  metadata: string;

  @OneToMany(
    () => BlogCustomField,
    bcf => bcf.blog,
  )
  blogCustomFields: BlogCustomField[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt: string;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: string;
}
