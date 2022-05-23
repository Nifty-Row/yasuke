import { LocalAuthGuard } from './../guards/local-auth.guard';
import { User } from './../models/user.entity';
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './../services/auth.service';
import { Response, ResponseUtils } from 'utils';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  async default() {
    return "Hello World";
  }

  @Post('register')
  async register(@Body() user: User): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.authService.register(user),
      'Your account was created successfully'
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return ResponseUtils.getSuccessResponse(
      await this.authService.login(req.user),
      'login successful'
    );
  }
}
