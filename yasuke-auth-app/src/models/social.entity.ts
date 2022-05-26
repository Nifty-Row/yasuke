import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Social {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegramUrl: string;

  @Column()
  facebookUrl: string;

  @Column()
  twitterUrl: string;

  @Column()
  youtubeUrl: string;

  @Column()
  pinterestUrl: string;

  @Column()
  discordUrl: string;
}
