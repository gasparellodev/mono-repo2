import { BadRequestException, Injectable } from '@nestjs/common';

import { CreateOpeningHoursDto } from './dtos/create-opening-hours.dto';
import { ResultsEnum } from '../../common/results.enum';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class OpeningHoursService {
  constructor(private readonly prisma: PrismaService) {}

  public async create({
    week_day,
    opening,
    closing,
    arena_id,
    lunch_opening,
    lunch_closing,
  }: CreateOpeningHoursDto) {
    const hasOpeningHourSameWeekDay = await this.prisma.openingHours.findFirst({
      where: {
        arena_id,
        week_day,
      },
    });

    if (hasOpeningHourSameWeekDay) {
      //there is already a schedule for this day of the week
      throw new BadRequestException(
        ResultsEnum.ThereIsAlreadyScheduleForThisDayOfTheWeek.toString(),
      );
    }

    return this.prisma.openingHours.create({
      data: {
        week_day,
        arena_id,
        closing,
        opening,
        lunch_opening,
        lunch_closing,
      },
    });
  }
}
