import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiProperty, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express-serve-static-core';

import { CreateReservationDto } from './dtos/create-reservation.dto';
import { FindAllInDayMapper } from './mappers/find-all-in-day.mapper';
import { FindByUserMapper } from './mappers/find-by-user.mapper';
import { ReservationsService } from './reservations.service';

@Controller('api/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @ApiProperty()
  @Get('/find-all-in-day')
  @ApiOkResponse({
    description:
      'Retorna as arenas proximas que possuem quadras disponiveis no dia',
    type: [FindAllInDayMapper],
  })
  @ApiQuery({
    name: 'date',
    type: Date,
    required: true,
    description: 'Data para consultar as arenas',
  })
  @ApiQuery({
    name: 'latitude',
    type: Number,
    required: true,
    description: 'Latitude do usuário',
  })
  @ApiQuery({
    name: 'longitude',
    type: Number,
    required: true,
    description: 'Longitude do usuário',
  })
  @ApiQuery({
    name: 'only_available',
    type: Boolean,
    required: false,
    description:
      'Se deve retornar apenas as arenas com quadras com horários disponíveis',
  })
  @ApiQuery({
    name: 'arena_id',
    type: String,
    required: false,
    description: 'Id da arena',
  })
  public async findAllInDay(
    @Query('date') date: Date,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('only_available') only_available?: boolean,
    @Query('arena_id') arena_id?: string,
  ) {
    const response = await this.reservationsService.findAllInDay(
      date,
      latitude,
      longitude,
      only_available,
      arena_id,
    );
    return response.map((reservation) => new FindAllInDayMapper(reservation));
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

  @Get('/find-by-user')
  @ApiOkResponse({
    description: 'Retorna as reservas do usuário',
    type: [FindByUserMapper],
  })
  public async findByUser(@Req() request: Request) {
    const response = await this.reservationsService.findByUser(request.user);
    return response.map((reservation) => new FindByUserMapper(reservation));
  }
}
