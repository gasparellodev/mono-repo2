import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 } from 'uuid';

import { PaymentGatewaysService } from '../arenas/payment-gateways/payment-gateways.service';
@Injectable()
export class MercadoPagoService {
  private readonly redirect_uri: string;
  private readonly client_id: string;
  private readonly access_token: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly paymentGatewaysService: PaymentGatewaysService,
  ) {
    this.redirect_uri = `${this.configService.get(
      'BACK_END_URL',
    )}/api/auth/mercado-pago/callback`;
    this.client_id = this.configService.get('MERCADO_PAGO_CLIENT_ID');
    this.access_token = this.configService.get('MERCADO_PAGO_ACCESS_TOKEN');
  }

  async getAuthorizationUrl(): Promise<string> {
    const state = v4();
    return `${this.configService.get('MERCADO_PAGO_URI_OAUTH')}?client_id=${
      this.client_id
    }&response_type=code&platform_id=mp&test_token=true&state=${state}&redirect_uri=${
      this.redirect_uri
    }`;
  }
  async getAccessToken(code: string): Promise<string> {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.client_id,
      client_secret: this.access_token,
      redirect_uri: this.redirect_uri,
      code,
    });

    try {
      const response = await axios.post(
        this.configService.get('MERCADO_PAGO_URI_OAUTH'),
        data,
      );
      console.log(response.data);

      return response.data.access_token;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
