import { User } from './../models/user.entity';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './../services/auth.service';
import { Response, ResponseUtils } from 'utils';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() user: User): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.authService.register(user),
      'Your account was created successfully'
    );
  }
}
