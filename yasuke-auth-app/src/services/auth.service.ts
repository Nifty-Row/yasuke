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

  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(userDetails: User): Promise<object> {
    return new Promise(async (resolve, reject) => {
      try {
        const { firstName, lastName, email, password, walletAddress } =
          userDetails;

        const user = await this.userRepository.save({
          firstName: firstName.toLocaleLowerCase(),
          lastName: lastName.toLocaleLowerCase(),
          email: email.toLocaleLowerCase(),
          password: hashPassword(password),
          walletAddress,
        });

        const payload = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          walletAddress: user.walletAddress,
          type: user.type,
          isActive: user.isActive,
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
    const payload = { email: user.email, sub: user.id };
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
