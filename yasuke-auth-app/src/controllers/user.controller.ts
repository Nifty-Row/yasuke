import { UserService } from './../services/user.service';
import { Controller, Post } from '@nestjs/common';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    async singin (): Promise<any> {

    }

    @Post(':userAddress')
    async follow ()
}