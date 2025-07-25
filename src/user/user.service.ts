import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

    async getAllUser() {
        return this.prismaService.user.findMany();
    }

    async createUser(email: string, password: string, firstName: string, lastName: string ) {
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
