import { Body, Controller, Post, UnauthorizedException, Res, ConflictException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dtos/register.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dtos/login.dto';
import { CurrentUser } from './decorators/currentUser.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserFromJwt } from './types/userForm.type';

@Controller('api/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private jwtService: JwtService,
        private userService: UserService,
        private configService: ConfigService,
    ) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        const user = await this.userService.getUserByEmail(dto.email);
        if (user) {
            throw new ConflictException('Email is already registered');
        }
        const { password, ...result } = await this.userService.createUser(dto.email, dto.password, dto.firstName, dto.lastName)
        return {
            message: "Register successful",
            user: result
        }
    }

    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.authService.validateUser(dto.email, dto.password);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload: UserFromJwt = { userId: user.id, email: user.email, isAdmin: user.isAdmin };
        const token = await this.jwtService.signAsync(payload);
        const cookieMaxAge = parseInt(this.configService.get('JWT_COOKIE_MAX_AGE') || '3600000');

        res.cookie('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: cookieMaxAge,
        });

        return {
            message: 'Login successful',
            user
        };
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(
        @CurrentUser() user: UserFromJwt,
        @Res({ passthrough: true }) res: Response
    ) {
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return { 
            message: 'Logout successful',
            user: user
         };
    }
}
