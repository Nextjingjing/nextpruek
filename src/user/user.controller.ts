import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorator/currentUser.decorator';
import { UserFromJwt } from '../auth/type/userForm.type';

@Controller('api/user')
export class UserController {
    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getUserById(@CurrentUser() user: UserFromJwt){

        return user;
    }
}
