import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

@Entity()
export class Session {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(
    () => User,
    user => user.sessions,
    { nullable: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('text')
  data: string;

  @Column({ default: false })
  isRevoked: boolean;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @Column('datetime')
  expiresAt: string;
}
