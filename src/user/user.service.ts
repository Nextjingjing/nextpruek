import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { getPagination } from '../common/utils/pagination.util';
import { UserEditDto } from './dtos/userEdit.dto';
import { User } from 'generated/prisma';
import { UserResponseDto } from './dtos/userResponse.dto';

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) { }

    async getUserByEmail(email: string) {
        return this.prismaService.user.findUnique({
            where: {
                email: email,
            },
        });
    }

    async getUserById(id: number) {
        return this.prismaService.user.findUnique({
            where: {
                id: id,
            },
        });
    }

    async getAllUser(page: number, limit: number = 20) {
        const { skip, take } = getPagination(page, limit);
        const [users, total] = await this.prismaService.$transaction([
            this.prismaService.user.findMany({
                skip,
                take,
                orderBy: { id: 'asc' },
            }),
            this.prismaService.user.count()
        ]);

        return {
            users,
            total,
            limit: take,
            page: skip
        };
    }

    async createUser(email: string, password: string, firstName: string, lastName: string) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return this.prismaService.user.create({
            data: {
                email: email,
                password: hashedPassword,
                firstName: firstName,
                lastName: lastName,
            }
        })
    }

    async editUser(id: number, dto: UserEditDto): Promise<User> {
        try {
            const updateData: any = { ...dto };

            if (dto.dateOfBirth) {
                const [day, month, year] = dto.dateOfBirth.split('/');
                const parsedDate = new Date(+year, +month - 1, +day);

                if (isNaN(parsedDate.getTime())) {
                    throw new BadRequestException('Invalid date format. Use DD/MM/YYYY.');
                }

                updateData.dateOfBirth = parsedDate;
            }

            const user: User = await this.prismaService.user.update({
                where: { id },
                data: updateData,
            });

            return user;

        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Email is already in use.');
            }

            if (error.code === 'P2025') {
                throw new NotFoundException(`User with id ${id} not found.`);
            }

            throw error;
        }
    }

    toUserResponseDto(user: User): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            phone: user.phone,
            isAdmin: user.isAdmin,
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null
        };
    }

    async deleteUser(id: number) {
        try {
            await this.prismaService.user.delete({
                where: { id },
            });
            return { message: `User with id ${id} has been deleted.` };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`User with id ${id} not found.`);
            }

            throw error;
        }
    }
}
