import { ResponseUtils, Response } from '../../utils';
import { UserService } from '../services/user.service';
import { Controller, Post, Get, Param } from '@nestjs/common';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:email')
  private async findOne(@Param('email') email: string): Promise<Response> {
    return ResponseUtils.getSuccessResponse(
      await this.userService.findOne(email),
      'User fetched successfully'
    );
  }
}
