import { Module } from '@nestjs/common';

import { AddressesModule } from './addresses/addresses.module';
import { ArenasController } from './arenas.controller';
import { ArenasService } from './arenas.service';
import { CourtsModule } from './courts/courts.module';
import { PrismaService } from '../prisma.service';
import { ReservationsModule } from './reservations/reservations.module';
import { OpeningHoursModule } from './opening-hours/opening-hours.module';

@Module({
  imports: [CourtsModule, AddressesModule, ReservationsModule, OpeningHoursModule],
  providers: [ArenasService, PrismaService],
  controllers: [ArenasController],
})
export class ArenasModule {}
