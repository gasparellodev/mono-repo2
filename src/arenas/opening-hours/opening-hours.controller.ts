import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

import { CreateOpeningHoursDto } from './dtos/create-opening-hours.dto';
import { OpeningHoursService } from './opening-hours.service';

@Controller('api/opening-hours')
export class OpeningHoursController {
  constructor(private readonly openingHoursService: OpeningHoursService) {}

  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Retorna o usuário criado',
  })
  public async create(@Body() createOpeningHoursDto: CreateOpeningHoursDto) {
    return this.openingHoursService.create(createOpeningHoursDto);
  }
}
