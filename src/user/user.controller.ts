import { Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { UserFromJwt } from '../auth/types/userForm.type';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { UserResponseDto } from './dtos/userResponse.dto';
import { PaginationResponseDto } from '../common/dtos/pagination.dto';

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
    async getAllUser(
        @Query('page') page = '1',
        @Query('limit') limit = '20'
    ) {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const { users, total } = await this.userService.getAllUser(pageNumber, limitNumber);
        const data: UserResponseDto[] = users.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            phone: user.phone,
            isAdmin: user.isAdmin,
        }));

        return new PaginationResponseDto<UserResponseDto>(data, pageNumber, limitNumber, total);
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

    // @UseGuards(AuthGuard('jwt'))
    // @Patch(':id')
}
