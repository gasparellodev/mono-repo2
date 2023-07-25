import { Module } from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { PrismaService } from '../../prisma.service';
import { ReservationsController } from './reservations.controller';

@Module({
  providers: [ReservationsService, PrismaService],
  controllers: [ReservationsController],
})
export class ReservationsModule {}
