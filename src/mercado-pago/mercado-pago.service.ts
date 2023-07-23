import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 } from 'uuid';

import { OauthTokenResponse } from './interfaces/oauth-token.response.interface';
import { PaymentGatewaysType } from '../arenas/payment-gateways/enums/payment-gateways-type.enum';
import { PaymentGatewaysService } from '../arenas/payment-gateways/payment-gateways.service';

@Injectable()
export class MercadoPagoService {
  private readonly redirect_uri: string;
  private readonly client_id: string;
  private readonly client_secret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly paymentGatewaysService: PaymentGatewaysService,
  ) {
    this.redirect_uri = `${this.configService.get(
      'BACK_END_URL',
    )}/api/auth/mercado-pago/callback`;
    this.client_id = this.configService.get('MERCADO_PAGO_CLIENT_ID');
    this.client_secret = this.configService.get('MERCADO_PAGO_ACCESS_TOKEN');
  }

  async getAuthorizationUrl(owner_id: string): Promise<string> {
    const state = v4();

    try {
      //Salva o state no banco de dados vinculado a arena
      await this.paymentGatewaysService.setState(state, owner_id);

      return `${this.configService.get('MERCADO_PAGO_URI_OAUTH')}?client_id=${
        this.client_id
      }&response_type=code&platform_id=mp&test_token=true&state=${state}&redirect_uri=${
        this.redirect_uri
      }`;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getAccessToken(code: string, state: string): Promise<string> {
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.client_id,
      client_secret: this.client_secret,
      redirect_uri: this.redirect_uri,
      test_token: 'true',
      code,
    });

    try {
      const url = `${this.configService.get(
        'MERCADO_PAGO_URI_API',
      )}/oauth/token`;
      const response = await axios.post<OauthTokenResponse>(url, data);

      await this.paymentGatewaysService.create(
        {
          type: PaymentGatewaysType.MERCADO_PAGO,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
        },
        state,
      );

      return response.data.access_token;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
