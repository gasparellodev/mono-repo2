import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express-serve-static-core';

import { CreateReservationDto } from './dtos/create-reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  public async test() {
    const today = new Date();
    return this.reservationsService.findAllInDay();
  }

  @Post()
  public async create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() request: Request,
  ) {
    return this.reservationsService.createReservation(
      createReservationDto,
      request.user,
    );
  }
}
