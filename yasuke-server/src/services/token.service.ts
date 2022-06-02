import { Logger } from '@ethersproject/logger';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import {
  IssueToken,
  Media,
  TokenInfo,
  AuctionInfo,
  Likes,
} from 'src/models/entities.model';
import { Repository } from 'typeorm';
import { ImageService } from './image.service';
import { YasukeService } from './yasuke.service';
import { AuctionService } from './auction.service';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    private imageService: ImageService,
    private yasukeService: YasukeService,
    private auctionService: AuctionService,
  ) {}

  @InjectRepository(TokenInfo)
  tokenInfoRepository: Repository<TokenInfo>;

  @InjectRepository(Media)
  mediaRepository: Repository<Media>;

  @InjectRepository(Likes) likesRepository: Repository<Likes>;

  async getTokenInfo(tokenId: number, chain: string): Promise<TokenInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const blockchainToken = await this.yasukeService.getTokenInfo(
          tokenId,
          chain,
        );

        const dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .andWhere('chain = :chain', { chain: chain })
          .leftJoinAndSelect('tokenInfo.media', 'media')
          .getOne();

        if (dbToken === undefined) {
          reject('Token with ID not found');
        }

        this.logger.debug(dbToken.media);

        const media = dbToken.media.map((x) => {
          x.tokenInfo = undefined;
          return x;
        });

        this.logger.debug(media);

        blockchainToken.media = media;
        blockchainToken.dateIssued = dbToken.dateIssued;
        blockchainToken.lastAuctionId = dbToken.lastAuctionId;
        blockchainToken.hasActiveAuction = dbToken.hasActiveAuction;
        blockchainToken.description = dbToken.description;
        blockchainToken.assetType = dbToken.assetType;
        blockchainToken.category = dbToken.category;
        blockchainToken.price = dbToken.price;
        blockchainToken.isApproved = dbToken.isApproved;
        resolve(blockchainToken);
      } catch (error) {
        reject(error);
      }
    });
  }

  async listTokens(
    options: IPaginationOptions,
    chain: string,
  ): Promise<Pagination<TokenInfo>> {
    const qb = await this.tokenInfoRepository
      .createQueryBuilder('tokenInfo')
      .where('chain = :chain', { chain: chain })
      .leftJoinAndSelect('tokenInfo.media', 'media')
      .orderBy('tokenInfo.dateIssued', 'DESC');

    return paginate<TokenInfo>(qb, options);
  }

  async listTokensWithAuction(
    options: IPaginationOptions,
    chain: string,
  ): Promise<TokenInfo[]> {
    const now = new Date();

    const qb = await this.tokenInfoRepository
      .createQueryBuilder('tokenInfo')
      .where('tokenInfo.chain = :chain', { chain })
      .andWhere('hasActiveAuction = :ha', { ha: true })
      .andWhere('isInAuction = :ia', { ia: true })
      .andWhere('isApproved = :iap', { iap: true })
      .leftJoinAndSelect('tokenInfo.media', 'media')
      .leftJoinAndMapOne(
        'tokenInfo.auctions',
        AuctionInfo,
        'auctions',
        'auctions.auctionId = tokenInfo.lastAuctionId and auctions.endDate > :now',
        { now: now },
      )
      .leftJoinAndMapOne(
        'tokenInfo.likes',
        Likes,
        'likes',
        'likes.tokenId = tokenInfo.tokenId',
      )
      .orderBy('tokenInfo.dateIssued', 'DESC')
      .getMany();

    return qb;
  }

  async changeTokenOwnership(tokenId: number, chain: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const blockToken = await this.yasukeService.getTokenInfo(
          tokenId,
          chain,
        );
        const dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .andWhere('chain = :chain', { chain: chain })
          .where('tokenId = :tid', { tid: tokenId })
          .getOne();

        if (blockToken.owner.toLowerCase() !== dbToken.owner.toLowerCase()) {
          dbToken.owner = blockToken.owner;
          await this.tokenInfoRepository.save(dbToken);
        }
      } catch (error) {
        reject(error);
      }
      resolve(true);
    });
  }

  async listTokensByOwner(
    options: IPaginationOptions,
    owner: string,
    chain: string,
  ): Promise<Pagination<TokenInfo>> {
    const qb = this.tokenInfoRepository
      .createQueryBuilder('tokenInfo')
      .leftJoinAndSelect('tokenInfo.media', 'media')
      .where('LOWER(owner) = :owner', { owner: owner.toLowerCase() })
      .andWhere('chain = :chain', { chain: chain })
      .orderBy('tokenInfo.dateIssued', 'DESC');
    return paginate<TokenInfo>(qb, options);
  }

  async setPrice(
    tokenId: number,
    price: string,
    chain: string,
  ): Promise<TokenInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .andWhere('chain = :chain', { chain: chain })
          .getOne();
        if (dbToken === undefined) {
          reject('Token with tokenId not found');
        }

        dbToken.price = price;
        await this.tokenInfoRepository.save(dbToken);
        resolve(dbToken);
      } catch (error) {
        reject(error);
      }
    });
  }

  async toggleApproved(tokenId: number, chain: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .andWhere('chain = :chain', { chain: chain })
          .getOne();
        if (dbToken === undefined) {
          reject('Token with tokenId not found');
        }

        dbToken.isApproved = !dbToken.isApproved;
        await this.tokenInfoRepository.save(dbToken);
        resolve(dbToken.isApproved);
      } catch (error) {
        reject(error);
      }
    });
  }

  async toggleSold(tokenId: number, chain: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: tokenId })
          .andWhere('chain = :chain', { chain: chain })
          .getOne();
        if (dbToken === undefined) {
          reject('Token with tokenId not found');
        }

        dbToken.sold = !dbToken.sold;
        await this.tokenInfoRepository.save(dbToken);
        resolve(dbToken.sold);
      } catch (error) {
        reject(error);
      }
    });
  }

  async issueToken(issueToken: IssueToken, chain: string): Promise<TokenInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        let dbToken = await this.tokenInfoRepository
          .createQueryBuilder('tokenInfo')
          .where('tokenId = :tid', { tid: issueToken.tokenId })
          .andWhere('chain = :chain', { chain: chain })
          .getOne();

        if (dbToken !== undefined) {
          reject('tokenId already exists');
        }

        dbToken = await this.yasukeService.getTokenInfo(
          issueToken.tokenId,
          chain,
        );
        this.logger.debug('Token From Blockchain');
        this.logger.debug(dbToken);
        dbToken.dateIssued = issueToken.dateIssued;
        dbToken.category = issueToken.category;
        dbToken.description = issueToken.description;
        dbToken.assetType = issueToken.assetType;
        dbToken.isInAuction = false;
        dbToken.isInSale = false;
        dbToken.isApproved = false;
        dbToken.price = '0';

        dbToken = await this.tokenInfoRepository.save(dbToken);

        // now let's save the images
        const medias: Media[] = [];

        if (issueToken.keys.length === issueToken.medias.length) {
          let count = 0;
          for (const key of issueToken.keys) {
            let dbMedia: Media = await this.mediaRepository
              .createQueryBuilder('media')
              .where('mediaKey = :key', { key: key })
              .andWhere('tokenInfoId = :tiid', { tiid: issueToken.tokenId })
              .getOne();

            if (dbMedia === undefined) {
              const imageUrl: string = await this.imageService.uploadAssetImage(
                issueToken.medias[count],
              );
              dbMedia = {
                tokenInfo: dbToken,
                mediaKey: key,
                media: imageUrl,
              };

              await this.mediaRepository.save(dbMedia);
              dbMedia.tokenInfo = undefined;
              medias.push(dbMedia);
            } else {
              medias.push(dbMedia);
              this.logger.debug(
                `Media Already Exists for tokenId and Key: [${issueToken.tokenId} -> ${key}]`,
              );
            }
            count++;
          }

          dbToken.media = medias;
          dbToken = await this.tokenInfoRepository.save(dbToken);

          resolve(dbToken);
        } else {
          reject('Keys and Medias not the same length');
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async toggleLike(tokenId: number, userAddress: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        if (tokenId === undefined) {
          reject('tokenId is required');
        }

        if (userAddress === undefined) {
          reject('userAddress is required');
        }

        const tokenLiked = await this.likesRepository
          .createQueryBuilder('likes')
          .where('tokenId = :tid', { tid: tokenId })
          .andWhere('userAddress = :ua', { ua: userAddress })
          .getOne();

        if (tokenLiked === undefined) {
          this.likesRepository.save({
            tokenId,
            userAddress,
          });

          resolve(true);
        }

        await this.likesRepository.delete({
          tokenId,
          userAddress,
        });

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
}
