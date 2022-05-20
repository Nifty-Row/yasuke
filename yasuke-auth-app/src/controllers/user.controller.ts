import { JwtAuthGuard } from './../guards/jwt-auth.guard';
import { ResponseUtils, Response } from '../../utils';
import { UserService } from '../services/user.service';
import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  private async getProfile(@Request() req): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.userService.findOne(req.user.email),
      'User fetched successfully'
    );
  }
}
