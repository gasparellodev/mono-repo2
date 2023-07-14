import { randomBytes } from 'crypto';

import { AuthorizationCode } from 'simple-oauth2';

import { OauthProvidersEnum } from '../../users/enums/oauth-providers.enum';
import { IUser } from '../../users/interfaces/user.interface';
import { IAuthParams } from '../interfaces/auth-params.interface';
import { IClient } from '../interfaces/client.interface';
import { IProvider } from '../interfaces/provider.interface';
export class OAuthClass {
  private readonly code: AuthorizationCode;
  private readonly authorization: IAuthParams;
  private readonly userDataUrl: string;

  constructor(
    private readonly provider: OauthProvidersEnum,
    private readonly client: IClient,
    private readonly url: string,
  ) {
    if (provider === OauthProvidersEnum.LOCAL) {
      throw new Error('Invalid provider');
    }

    this.code = new AuthorizationCode({
      client,
      auth: OAuthClass[provider],
    });
    this.authorization = OAuthClass.generateAuthorization(provider, url);
    this.userDataUrl = OAuthClass.userDataUrls[provider];
  }

  private static readonly [OauthProvidersEnum.GOOGLE]: IProvider = {
    authorizeHost: 'https://accounts.google.com',
    authorizePath: '/o/oauth2/v2/auth',
    tokenHost: 'https://www.googleapis.com',
    tokenPath: '/oauth2/v4/token',
  };

  private static userDataUrls: Record<OauthProvidersEnum, string> = {
    [OauthProvidersEnum.GOOGLE]:
      'https://www.googleapis.com/oauth2/v3/userinfo',
    [OauthProvidersEnum.APPLE]: '',
    [OauthProvidersEnum.LOCAL]: '',
  };

  private static generateAuthorization(
    provider: OauthProvidersEnum,
    url: string,
  ) {
    const redirect_uri = `${url}/api/auth/ext/${provider}/callback`;

    const state = randomBytes(16).toString('hex');

    switch (provider) {
      case OauthProvidersEnum.GOOGLE:
        return {
          state,
          redirect_uri,
          scope: [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
          ],
        };
    }
  }

  public get state(): string {
    return this.authorization.state;
  }

  public get dataUrl(): string {
    return this.userDataUrl;
  }

  public get authorizationUrl(): string {
    return this.code.authorizeURL(this.authorization);
  }

  public async getToken(code: string): Promise<string> {
    const result = await this.code.getToken({
      code,
      redirect_uri: this.authorization.redirect_uri,
      scope: this.authorization.scope,
    });
    return result.token.access_token as string;
  }
}
