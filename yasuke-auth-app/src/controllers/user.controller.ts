import { JwtAuthGuard } from './../guards/jwt-auth.guard';
import { ResponseUtils, Response } from '../../utils';
import { UserService } from '../services/user.service';
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  Param,
} from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async default() {
    return "Hello World";
  }
    
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  private async getProfile(@Request() req): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.userService.findOne(req.user.email),
      'User fetched successfully'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('socials')
  private async getUserSocials(@Request() req): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.userService.getUserSocials(req.user.id),
      'User social media data fetched successfully'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-social')
  async addSocial(@Request() req, @Body() body) {
    body.userId = req.user.userId;

    return ResponseUtils.getSuccessResponse(
      await this.userService.addUserSocials(body),
      'socials added successfully'
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('follow/:followUserAddress')
  async follow(
    @Param('followUserAddress') followUserAddress: string,
    @Request() req
  ) {
    return ResponseUtils.getSuccessResponse(
      await this.userService.follow(req.user.walletAddress, followUserAddress)
    );
  }
}
