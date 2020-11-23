import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryColumn('uuid')
  id: string;

  @Column('varchar')
  title: string;

  @Column('text')
  body: string;

  @Column('text')
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

  @Column()
  metadata: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column('datetime')
  updatedAt: string;
}
