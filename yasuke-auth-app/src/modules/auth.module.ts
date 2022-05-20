import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './../../configs/local.strategy';
import { UserModule } from './user.module';
import { User } from './../models/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './../services/auth.service';
import { AuthController } from './../controllers/auth.controller';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot(),
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRY_IN_SECONDS },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
})
export class AuthModule {}
