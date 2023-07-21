import { Controller, Get, Query, Redirect } from '@nestjs/common';

import { MercadoPagoService } from './mercado-pago.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/auth')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Get('mercado-pago')
  @Public()
  @Redirect()
  async redirectToMercadoPagoAuth() {
    const authorizationUrl =
      await this.mercadoPagoService.getAuthorizationUrl();
    return { url: authorizationUrl };
  }

  @Get('mercado-pago/callback')
  async mercadoPagoAuthCallback(@Query('code') code: string) {
    const accessToken = await this.mercadoPagoService.getAccessToken(code);

    return { accessToken };
  }
}
