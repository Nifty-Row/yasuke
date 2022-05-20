import { hashPassword, generateFreshUserTokens } from './../../utils';
import { User } from './../models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  @InjectRepository(User) userRepository: Repository<User>;

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
}
