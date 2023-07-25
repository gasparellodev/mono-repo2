import { Module } from '@nestjs/common';

import { AddressesModule } from './addresses/addresses.module';
import { ArenasController } from './arenas.controller';
import { ArenasService } from './arenas.service';
import { CourtsModule } from './courts/courts.module';
import { OpeningHoursModule } from './opening-hours/opening-hours.module';
import { PaymentGatewaysModule } from './payment-gateways/payment-gateways.module';
import { ReservationsModule } from './reservations/reservations.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    CourtsModule,
    AddressesModule,
    ReservationsModule,
    OpeningHoursModule,
    PaymentGatewaysModule,
  ],
  providers: [ArenasService, PrismaService],
  controllers: [ArenasController],
})
export class ArenasModule {}
