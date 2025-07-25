import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { getPagination } from '../common/utils/pagination.util';

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

        return { users, total };
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


}
