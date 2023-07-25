import { BadRequestException, Injectable } from '@nestjs/common';
import bigDecimal from 'js-big-decimal';

import { CreateCourtDto } from './dtos/create-court.dto';
import { ResultsEnum } from '../../common/results.enum';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CourtsService {
  constructor(private readonly prisma: PrismaService) {}
  public async create({
    name,
    type_court,
    sport_type,
    value_per_hour,
    court_digital_timer,
    covered_court,
    court_cam_replay,
    arena_id,
  }: CreateCourtDto) {
    const arena = await this.prisma.arena.findUnique({
      where: { id: arena_id },
    });

    console.log(arena);

    if (arena == null) {
      throw new BadRequestException(ResultsEnum.ArenaDoesNotExists.toString());
    }

    let court;
    try {
      const convertedValue = new bigDecimal(value_per_hour);

      court = this.prisma.court.create({
        data: {
          name,
          type_court,
          sport_type,
          value_per_hour: parseFloat(convertedValue.getValue()),
          covered_court,
          court_digital_timer,
          court_cam_replay,
          arena_id,
        },
      });
    } catch (e) {
      throw new BadRequestException(
        ResultsEnum.ErrorRegisteringCourt.toString(),
      );
    }

    return court;
  }
}
