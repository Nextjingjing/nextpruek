import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, ParseIntPipe, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { UserFromJwt } from '../auth/types/userForm.type';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserService } from './user.service';
import { User } from 'generated/prisma';
import { UserResponseDto } from './dtos/userResponse.dto';
import { PaginationResponseDto } from '../common/dtos/pagination.dto';
import { UserEditDto } from './dtos/userEdit.dto';

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

        const pagination = await this.userService.getAllUser(pageNumber, limitNumber);
        const data: UserResponseDto[] = pagination.users.map((user) => (
            this.userService.toUserResponseDto(user)
        ));

        return new PaginationResponseDto<UserResponseDto>(
            data, 
            pagination.page,
            pagination.limit, 
            pagination.total
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getUserById(
        @CurrentUser() currentUser: UserFromJwt,
        @Param('id', ParseIntPipe) id: number
    ) {
        if (!currentUser.isAdmin && currentUser.userId !== id) {
            throw new ForbiddenException(
                `You can only access your own data. try GET /api/user/${currentUser.userId}`);
        }
        const user: User | null = await this.userService.getUserById(id);
        if (!user) throw new NotFoundException(`userId = ${id} is not found.`)
        const dto: UserResponseDto = this.userService.toUserResponseDto(user);
        return dto;
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async editUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UserEditDto,
        @CurrentUser() currentUser: UserFromJwt
    ) {
        if(currentUser.userId !== id) throw new ForbiddenException(
            `You can only edit your own profile. try PATCH /api/user/${currentUser.userId}`);
        
        const user: User = await this.userService.editUser(id, dto);
        return this.userService.toUserResponseDto(user);
    }
}
