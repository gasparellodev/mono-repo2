import { Module } from '@nestjs/common';

import { PaymentGatewaysService } from './payment-gateways.service';
import { PrismaService } from '../../prisma.service';

@Module({
  providers: [PaymentGatewaysService, PrismaService],
})
export class PaymentGatewaysModule {}
