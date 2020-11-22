import { User } from 'src/users/entities/user.entity';
import { Column, ManyToOne, PrimaryColumn } from 'typeorm';

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

  @ManyToOne(
    () => User,
    user => user.blogs,
    { onDelete: 'NO ACTION' },
  )
  author: User;

  @Column()
  metadata: string;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column('datetime')
  updatedAt: string;
}
