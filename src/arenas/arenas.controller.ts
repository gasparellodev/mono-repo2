import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express-serve-static-core';

import { ArenasService } from './arenas.service';
import { CreateArenaDto } from './dtos/create-arena.dto';

@Controller('arenas')
export class ArenasController {
  constructor(private readonly arenasService: ArenasService) {}

  @Get()
  public async get(@Req() req: Request) {
    return this.arenasService.get(req.user);
  }

  @Post()
  public async create(@Body() arena: CreateArenaDto, @Req() req: Request) {
    return this.arenasService.create(arena, req.user);
  }

  @Get('nearby')
  public async getNearbyArenas(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ) {
    return this.arenasService.getNearbyArenas(latitude, longitude);
  }
  // @Get('nearby/available-time')
  // public async getNearbyArenasAndAvailableTime(
  //   @Query('latitude') latitude: number,
  //   @Query('longitude') longitude: number,
  // ) {
  //   return this.arenasService.getNearbyArenasAvailableTime();
  // }
}
