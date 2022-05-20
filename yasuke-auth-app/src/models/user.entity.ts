import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Social } from './social.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

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
  profile: string;

  @OneToOne(() => Social, (social) => social.user)
  social: Social;
}
