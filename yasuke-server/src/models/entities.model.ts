import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tokenInfo')
@Unique('token_info_idx', ['tokenId', 'contractAddress'])
export class TokenInfo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Index('tokenId-idx')
  @Column({ width: 20, type: 'bigint' })
  tokenId: number;

  @Index('chain-idx')
  @Column()
  chain: string;

  @Index('owner-idx')
  @Column()
  owner: string;

  @Index('issuer-idx')
  @Column()
  issuer: string;

  @Index('contract-idx')
  @Column()
  contractAddress: string;

  @OneToMany(() => Media, (media) => media.tokenInfo)
  media: Media[];

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column({ width: 20, type: 'bigint' })
  dateIssued: number;

  @Column()
  hasActiveAuction: boolean;

  @Column()
  lastAuctionId: number;

  @Column()
  category: string;

  @Column()
  sold: boolean;

  @Column()
  description: string;

  @Column()
  assetType: string;

  @Column()
  isInAuction: boolean;

  @Column()
  isInSale: boolean;

  @Column()
  isApproved: boolean;

  @Column()
  price: string;
}

@Entity('auctionInfo')
@Unique('auction_info_idx', ['auctionId'])
export class AuctionInfo {
  @PrimaryGeneratedColumn()
  id?: number;

  @Index('auctionId-idx')
  @Column({ width: 20, type: 'bigint' })
  auctionId: number;

  @Index('tokenId-idx')
  @Column({ width: 20, type: 'bigint' })
  tokenId: number;

  @Index('chain-idx')
  @Column()
  chain: string;

  @Index('owner-idx')
  @Column()
  owner: string;

  @Column({ width: 20, type: 'bigint' })
  startBlock: number;

  @Column({ width: 20, type: 'bigint' })
  endBlock: number;

  @Column({ width: 20, type: 'bigint' })
  currentBlock: number;

  @Column()
  sellNowPrice: string;

  @Column()
  highestBidder: string;

  @Column()
  highestBid: string;

  @Column()
  cancelled: boolean;

  @Column()
  minimumBid: string;

  @Column({ default: false })
  started: boolean;

  @Column({ default: false })
  finished: boolean;

  @Column()
  startDate?: string;

  @Column()
  endDate?: string;

  @Column({ default: false })
  sellNowTriggered: boolean;

  bids: Bid[];
  _bidders?: string[];
  _bids?: number[];
}

export class Bid {
  auctionId: number;
  tokenId: number;
  bid: number;
  bidder: string;
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  mediaKey: string;

  @Column()
  media: string;

  @ManyToOne(() => TokenInfo, (tokenInfo) => tokenInfo.media)
  tokenInfo: TokenInfo;
}

export class IssueToken {
  @ApiProperty()
  @Column({ width: 20, type: 'bigint' })
  tokenId: number;

  @ApiProperty()
  @Column({ width: 20, type: 'bigint' })
  dateIssued: number;

  @ApiProperty()
  @IsNotEmpty()
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  assetType: string;

  @ApiProperty()
  @IsNotEmpty()
  medias: string[];

  @ApiProperty()
  @IsNotEmpty()
  keys: string[];
}

export enum CATEGORIES {
  IMAGE = 'image',
  MP3 = 'mp3',
  MP4 = 'mp4',
  PDF = 'pdf',
}

export class StartAuction {
  @ApiProperty()
  @IsNotEmpty()
  tokenId: number;

  @ApiProperty()
  @IsNotEmpty()
  auctionId: number;

  @ApiProperty()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty()
  @IsNotEmpty()
  endDate: string;
}

@Entity('likes')
export class Likes {
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty()
  @Column({ width: 20, type: 'bigint' })
  tokenId: number;

  @Column()
  userAddress: string;
}

@Entity()
export class UserPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  walletAddress: string;

  @Column({ nullable: true })
  displayImage: string;

  @Column({ nullable: true })
  coverImage: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
