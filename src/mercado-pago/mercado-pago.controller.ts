import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express-serve-static-core';

import { MercadoPagoService } from './mercado-pago.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/auth')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Get('mercado-pago')
  async redirectToMercadoPagoAuth(@Req() req: Request) {
    const authorizationUrl = await this.mercadoPagoService.getAuthorizationUrl(
      req.user,
    );
    return { url: authorizationUrl };
  }

  @Get('mercado-pago/callback')
  @Public()
  async mercadoPagoAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    const accessToken = await this.mercadoPagoService.getAccessToken(
      code,
      state,
    );

    return { accessToken };
  }
}
