import { Social } from './../models/social.entity';
import { User } from './../models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User) private userRepository: Repository<User>;
  @InjectRepository(Social) private socialRepository: Repository<Social>;

  async findOne(email: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.userRepository.findOne({ email });

        if (!user) {
          reject(user);
        }

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getUserSocials(userId: number): Promise<Social> {
    return new Promise(async (resolve, reject) => {
      try {
        const socials = await this.socialRepository.findOne({ userId });

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
}
