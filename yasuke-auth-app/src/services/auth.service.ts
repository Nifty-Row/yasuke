import { ImageService } from '../services/image.service';
import { UserPhoto } from './../models/userPhoto.entity';
import { Social } from './../models/social.entity';
import { UserService } from './user.service';
import {
  hashPassword,
  generateFreshUserTokens,
  comparePassword,
} from './../../utils';
import { User } from './../models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  @InjectRepository(User) userRepository: Repository<User>;

  @InjectRepository(Social) socialRepository: Repository<Social>;

  @InjectRepository(UserPhoto) photoRepository: Repository<UserPhoto>;

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private imageService: ImageService
  ) {}

  async register(userDetails: User): Promise<object> {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          firstName,
          lastName,
          username,
          email,
          password,
          walletAddress,
          about,
          type,
          social,
          webUrl,
          photo,
        } = userDetails;

        let joinDate = new Date();

        const userSocials = await this.socialRepository.save(social);

        const displayImage: string = await this.imageService.uploadAssetImage(
          photo.displayImage
        );

        const coverImage: string = await this.imageService.uploadAssetImage(
          photo.coverImage
        );

        const photos = {
          coverImage,
          displayImage,
        };

        const userPhoto = await this.photoRepository.save(photos);

        const user = await this.userRepository.save({
          firstName: firstName.toLocaleLowerCase(),
          lastName: lastName.toLocaleLowerCase(),
          username,
          email: email.toLocaleLowerCase(),
          password: hashPassword(password),
          walletAddress,
          about,
          type,
          joinDate,
          webUrl,
          social: userSocials,
          photo: userPhoto,
        });

        const payload = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          walletAddress: user.walletAddress,
          type: user.type,
          isActive: user.isActive,
          about,
          social,
          webUrl,
          photos,
        };

        const { accessToken } = await generateFreshUserTokens(payload);

        const response = {
          data: { accessToken, ...payload },
        };

        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  async login(user: User) {
    const payload = { ...user, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      ...user,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOne(email);

    if (user && comparePassword(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }
}
