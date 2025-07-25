import { Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorator/currentUser.decorator';
import { UserFromJwt } from '../auth/type/userForm.type';
import { AdminGuard } from '../auth/guard/admin.guard';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { UserResponseDto } from './dto/userResponse.dto';

@Controller('api/user')
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getUserByJwt(@CurrentUser() currentUser: UserFromJwt) {

        return currentUser;
    }

    @UseGuards(AuthGuard('jwt'), AdminGuard)
    @Get()
    async getAllUser() {
        const users: User[] = await this.userService.getAllUser();
        const dto: UserResponseDto[] = [];

        users.forEach((user: User) => {
            dto.push({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                phone: user.phone,
                isAdmin: user.isAdmin
            })
        });
        return dto;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getUserById(
        @CurrentUser() currentUser: UserFromJwt,
        @Param('id', ParseIntPipe) id: number
    ) {
        if (!currentUser.isAdmin && currentUser.userId !== id) {
            throw new ForbiddenException('You can only access your own data.');
        }
        const user: User | null = await this.userService.getUserById(id);
        if (!user) throw new NotFoundException(`userId = ${id} is not found.`)
        const dto: UserResponseDto = {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                phone: user.phone,
                isAdmin: user.isAdmin
            }
        return dto;
    }

}
