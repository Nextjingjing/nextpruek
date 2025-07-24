import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HotelService {
    constructor(private prismaService: PrismaService) { }

    async getAllHotel() {
        return this.prismaService.hotel.findMany();
    }

    async getHotel(id: number) {
        return this.prismaService.hotel.findUniqueOrThrow({
            where: {
                id: id,
            },
        });
    }
}
