import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 } from 'uuid';
@Injectable()
export class MercadoPagoService {
  private readonly redirect_uri: string;
  private readonly client_id: string;
  private readonly access_token: string;
  constructor(private readonly configService: ConfigService) {
    this.redirect_uri = `${this.configService.get(
      'BACK_END_URL',
    )}/api/auth/mercado-pago/callback`;
    this.client_id = this.configService.get('MERCADO_PAGO_CLIENT_ID');
    this.access_token = this.configService.get('MERCADO_PAGO_ACCESS_TOKEN');
  }

  async getAuthorizationUrl(): Promise<string> {
    const state = v4();
    return `https://auth.mercadopago.com.ar/authorization?client_id=${this.client_id}&response_type=code&platform_id=mp&state=${state}&redirect_uri=${this.redirect_uri}`;
  }
  async getAccessToken(code: string): Promise<string> {
    const tokenEndpoint = 'https://api.mercadopago.com.ar/oauth/token';
    const data = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.client_id,
      client_secret: this.access_token,
      redirect_uri: this.redirect_uri,
      code,
    });

    const response = await axios.post(tokenEndpoint, data);
    return response.data.access_token;
  }
}
