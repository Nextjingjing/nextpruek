import { Controller, Get } from '@nestjs/common';
import { HotelService } from './hotel.service';

@Controller('api/hotel')
export class HotelController {
    constructor(private hotelService: HotelService) {}

    @Get()
    getUsers() {
    return this.hotelService.getAllHotel();
  }
}
