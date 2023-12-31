import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express-serve-static-core';

import { ArenasService } from './arenas.service';
import { CreateArenaDto } from './dtos/create-arena.dto';
import { SearchArenaMapper } from './mappers/search-arena.mapper';

@Controller('/api/arenas')
export class ArenasController {
  constructor(private readonly arenasService: ArenasService) {}

  @Get()
  public async get(@Req() req: Request) {
    return this.arenasService.get(req.user);
  }

  @ApiOkResponse({
    description: 'Retorna as arenas que correspondem o termo de busca',
    type: [SearchArenaMapper],
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
    name: 'input',
    type: String,
    required: true,
    description: 'Termo de busca',
  })
  @Get('search')
  public async searchByLocation(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('input') input: string,
  ) {
    const arenas = await this.arenasService.searchByLocation(
      longitude,
      latitude,
      input,
    );
    return arenas.map((arena) => new SearchArenaMapper(arena));
  }

  @Post()
  public async create(@Body() arena: CreateArenaDto, @Req() req: Request) {
    return this.arenasService.create(arena, req.user);
  }

  @Get('nearby')
  public async getNearbyArenas(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('filter') filter?: Array<string>,
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
