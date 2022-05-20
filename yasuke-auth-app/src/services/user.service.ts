import { User } from './../models/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  @InjectRepository(User) private userRepository: Repository<User>;

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
}
