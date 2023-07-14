import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { CourtsService } from './courts.service';
import { CreateCourtDto } from './dtos/create-court.dto';

@Controller('courts')
export class CourtsController {
  constructor(private readonly courtsService: CourtsService) {}

  @Post()
  public async get(@Body() createCourtDto: CreateCourtDto) {
    return this.courtsService.create(createCourtDto);
  }
}
