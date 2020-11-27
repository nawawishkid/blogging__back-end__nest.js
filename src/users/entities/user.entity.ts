import { Session } from '../../sessions/entities/session.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { Blog } from '../../blogs/entities/blog.entity';

@Entity()
@Unique(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn()
  @IsInt()
  id: number;

  @Column()
  @IsEmail()
  email: string;

  @Column({ type: 'text', select: false })
  @Exclude()
  password: string;

  @Column()
  @IsString()
  username: string;

  @Column({ default: false })
  @IsBoolean()
  emailIsVerified: boolean;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  firstName: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  lastName: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  // @IsString()
  createdAt: string;

  @OneToMany(
    () => Session,
    session => session.user,
  )
  @Exclude()
  sessions: Session[];

  @OneToMany(
    () => Blog,
    blog => blog.author,
  )
  blogs: Blog[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
