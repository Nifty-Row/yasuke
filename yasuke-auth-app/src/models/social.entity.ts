import { User } from './user.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Social {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  telegram: string;

  @Column()
  facebook: string;

  @Column()
  twitter: string;

  @Column()
  youtube: string;

  @OneToOne(() => User, (user) => user.social)
  user: User;
}
