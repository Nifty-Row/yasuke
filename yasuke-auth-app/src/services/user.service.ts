import { UserFollower } from './../models/userFollower.entity';
import { Social } from './../models/social.entity';
import { User } from './../models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User) private userRepository: Repository<User>;
  @InjectRepository(Social) private socialRepository: Repository<Social>;
  @InjectRepository(UserFollower)
  private userFollower: Repository<UserFollower>;

  async findOne(email: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        const userProfile = await this.userRepository
          .createQueryBuilder('user')
          .where('email = :email', { email })
          .leftJoinAndSelect('user.social', 'social')
          .getOne();

        if (!userProfile) {
          reject(userProfile);
        }

        resolve(userProfile);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getUserSocials(userId: number): Promise<Social> {
    return new Promise(async (resolve, reject) => {
      try {
        const socials = await this.socialRepository.findOne();

        if (!socials) {
          reject(socials);
        }

        resolve(socials);
      } catch (error) {
        reject(error.message);
      }
    });
  }

  async addUserSocials(data: Social): Promise<Social> {
    return new Promise(async (resolve, reject) => {
      try {
        const social = await this.socialRepository.save(data);

        if (!social) {
          reject(social);
        }

        resolve(social);
      } catch (error) {
        reject(error);
      }
    });
  }

  async follow(
    userAddress: string,
    followUserAddress: string
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const userFollowing = await this.userFollower.find({
          userAddress,
          followUserAddress,
        });

        if (userFollowing == null) {
          reject('You are already following this user');
        }

        await this.userFollower.save({
          userAddress,
          followUserAddress,
        });

        resolve('You have successfully followed this user');
      } catch (error) {
        reject(error);
      }
    });
  }
}
