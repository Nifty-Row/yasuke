import { ConfigModule } from '@nestjs/config';
import { User } from './../models/user.entity';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './../services/auth.service';
import { AuthController } from './../controllers/auth.controller';
import { Module } from '@nestjs/common';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
