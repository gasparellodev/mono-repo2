import { Injectable } from '@nestjs/common';

import { AddPaymentGatewayDto } from './dtos/add-payment-gateway.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PaymentGatewaysService {
  constructor(private readonly prisma: PrismaService) {}

  public async create({
    type,
    arena_id,
    access_token,
    refresh_token,
    expires_in,
  }: AddPaymentGatewayDto) {
    return this.prisma.paymentGateway.create({
      data: {
        type,
        arena_id,
        access_token,
        refresh_token,
        expires_in,
      },
    });
  }
}
