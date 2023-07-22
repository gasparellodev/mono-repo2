import { Injectable } from '@nestjs/common';

import { AddPaymentGatewayDto } from './dtos/add-payment-gateway.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PaymentGatewaysService {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    {
      type,
      arena_id,
      access_token,
      refresh_token,
      expires_in,
    }: AddPaymentGatewayDto,
    state: string,
  ) {
    return this.prisma.paymentGateway.update({
      where: {
        state,
      },
      data: {
        type,
        arena_id,
        access_token,
        refresh_token,
        expires_in,
      },
    });
  }

  public async setState(state: string, owner_id: string) {
    const arena = await this.prisma.arena.findFirst({
      where: {
        owner_id,
      },
    });
    return this.prisma.paymentGateway.create({
      data: {
        state,
        arena_id: arena.id,
      },
    });
  }
}
