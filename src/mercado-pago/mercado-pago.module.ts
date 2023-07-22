import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MercadoPagoController } from './mercado-pago.controller';
import { MercadoPagoService } from './mercado-pago.service';
import { PaymentGatewaysService } from '../arenas/payment-gateways/payment-gateways.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [
    MercadoPagoService,
    ConfigService,
    PaymentGatewaysService,
    PrismaService,
  ],
  controllers: [MercadoPagoController],
})
export class MercadoPagoModule {}
