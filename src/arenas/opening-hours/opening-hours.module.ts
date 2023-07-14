import { Module } from '@nestjs/common';

import { OpeningHoursService } from './opening-hours.service';
import { PrismaService } from '../../prisma.service';
import { OpeningHoursController } from './opening-hours.controller';

@Module({
  providers: [OpeningHoursService, PrismaService],
  controllers: [OpeningHoursController],
})
export class OpeningHoursModule {}
