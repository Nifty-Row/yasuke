import { UserPhoto } from './userPhoto.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Social } from './social.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 255 })
  walletAddress: string;

  @Column({ default: 'fiat-user' })
  type: string;

  @Column({ nullable: false, type: 'varchar', length: 255 })
  about: string;

  @Column()
  joinDate: Date;

  @Column({ nullable: true })
  webUrl: string;

  @OneToOne(() => Social)
  @JoinColumn()
  social: Social;

  @OneToOne(() => UserPhoto)
  @JoinColumn()
  photo: UserPhoto;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
