import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { HotelService } from './hotel.service';

@Controller('api/hotel')
export class HotelController {
    constructor(private hotelService: HotelService) {}

    @Get()
    getAllHotel() {
    return this.hotelService.getAllHotel();
  }

  @Get(':id')
  getHotelById(@Param('id', ParseIntPipe) id: number) {
    return this.hotelService.getHotel(id);
  }

  // @Post()
  // createHotel() {
    
  // }
}
