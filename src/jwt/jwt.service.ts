import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Credentials, User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { v4 } from 'uuid';

import { TokenTypeEnum } from './enums/token-type.enum';
import {
  IAccessPayload,
  IAccessToken,
} from './interfaces/access-token.interface';
import { IEmailPayload, IEmailToken } from './interfaces/email-token.interface';
import {
  IRefreshPayload,
  IRefreshToken,
} from './interfaces/refresh-token.interface';
import { CommonService } from '../common/common.service';
import { ResultsEnum } from '../common/results.enum';
import { IJwt } from '../config/interfaces/jwt.interface';
import { IUser } from '../users/interfaces/user.interface';

@Injectable()
export class JwtService {
  private readonly jwtConfig: IJwt;
  private readonly issuer: string;
  private readonly domain: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly commonService: CommonService,
  ) {
    this.jwtConfig = this.configService.get<IJwt>('jwt');
    this.issuer = this.configService.get<string>('id');
    this.domain = this.configService.get<string>('domain');
  }

  /**
   * Generates a new JWT token asynchronously.
   *
   * @async
   * @private
   * @param {(IAccessPayload | IEmailPayload | IRefreshPayload)} payload - The payload to be encoded into the token.
   * @param {string} secret - The secret key to use for signing the token.
   * @param {jwt.SignOptions} options - The options to use for signing the token.
   * @returns {Promise<string>} A promise that resolves to the generated token.
   * @throws {Error} If the token generation fails.
   */
  private static async generateTokenAsync(
    payload: IAccessPayload | IEmailPayload | IRefreshPayload,
    secret: string,
    options: jwt.SignOptions,
  ): Promise<string> {
    return new Promise((resolve, rejects) => {
      jwt.sign(payload, secret, options, (error, token) => {
        if (error) {
          rejects(error);
          return;
        }
        resolve(token);
      });
    });
  }

  /**
   * Verifies the authenticity of a JWT token asynchronously.
   *
   * @async
   * @private
   * @param {string} token - The token to be verified.
   * @param {string} secret - The secret key to use for verifying the token.
   * @param {jwt.VerifyOptions} options - The options to use for verifying the token.
   * @returns {Promise<T>} A promise that resolves to the decoded payload of the token.
   * @throws {Error} If the token verification fails.
   */
  private static async verifyTokenAsync<T>(
    token: string,
    secret: string,
    options: jwt.VerifyOptions,
  ): Promise<T> {
    return new Promise((resolve, rejects) => {
      jwt.verify(token, secret, options, (error, payload: T) => {
        if (error) {
          rejects(error);
          return;
        }
        resolve(payload);
      });
    });
  }

  /**
   * Generates a JWT token for the given user and token type.
   *
   * @async
   * @param {IUser} user - The user for whom the token is being generated.
   * @param {TokenTypeEnum} token_type - The type of token to be generated.
   * @param {(string|null|undefined)} [domain] - The domain for which the token is being generated.
   * @param {string} [token_id] - The id of the token.
   * @returns {Promise<string>} A promise that resolves to the generated token.
   * @throws {Error} If the token generation fails.
   */
  public async generateToken(
    user: User & { credentials: Credentials },
    token_type: TokenTypeEnum,
    domain?: string | null,
    token_id?: string,
  ): Promise<string> {
    const jwtOptions: jwt.SignOptions = {
      issuer: this.issuer,
      subject: user.email,
      audience: domain ?? this.domain,
      algorithm: 'HS256', // only needs a secret
    };

    switch (token_type) {
      case TokenTypeEnum.ACCESS:
        const { privateKey, time: accessTime } = this.jwtConfig.access;
        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync({ id: user.id }, privateKey, {
            ...jwtOptions,
            expiresIn: accessTime,
            algorithm: 'RS256', // to use public and private key
          }),
        );
      case TokenTypeEnum.REFRESH:
        const { secret: refreshSecret, time: refreshTime } =
          this.jwtConfig.refresh;
        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync(
            {
              id: user.id,
              version: user.credentials.version,
              token_id: token_id ?? v4(),
            },
            refreshSecret,
            {
              ...jwtOptions,
              expiresIn: refreshTime,
            },
          ),
        );
      case TokenTypeEnum.CONFIRMATION:
      case TokenTypeEnum.RESET_PASSWORD:
        const { secret, time } = this.jwtConfig[token_type];
        return this.commonService.throwInternalError(
          JwtService.generateTokenAsync(
            { id: user.id, version: user.credentials.version },
            secret,
            {
              ...jwtOptions,
              expiresIn: time,
            },
          ),
        );
    }
  }

  /**
   * Verifies the given token based on its type and returns the payload.
   * @param token - The token to verify.
   * @param token_type - The type of token to verify.
   * @returns A Promise that resolves to the payload of the verified token.
   * @throws {BadRequestException} If the token is invalid or expired.
   */
  public async verifyToken<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(token: string, token_type: TokenTypeEnum): Promise<T> {
    const jwtOptions: jwt.VerifyOptions = {
      issuer: this.issuer,
      audience: new RegExp(this.domain),
    };

    switch (token_type) {
      case TokenTypeEnum.ACCESS:
        const { publicKey, time: accessTime } = this.jwtConfig.access;
        return JwtService.throwBadRequest(
          JwtService.verifyTokenAsync(token, publicKey, {
            ...jwtOptions,
            maxAge: accessTime,
            algorithms: ['RS256'],
          }),
        );
      case TokenTypeEnum.REFRESH:
      case TokenTypeEnum.CONFIRMATION:
      case TokenTypeEnum.RESET_PASSWORD:
        const { secret, time } = this.jwtConfig[token_type];
        return JwtService.throwBadRequest(
          JwtService.verifyTokenAsync(token, secret, {
            ...jwtOptions,
            maxAge: time,
            algorithms: ['HS256'],
          }),
        );
    }
  }

  /**
   * Handles errors thrown during token verification and throws the corresponding BadRequestException.
   * @param promise - The Promise to handle errors for.
   * @returns A Promise that resolves to the result of the original Promise.
   * @throws {BadRequestException} If the error is a TokenExpiredError or JsonWebTokenError.
   * @throws {InternalServerErrorException} If the error is anything else.
   */
  private static async throwBadRequest<
    T extends IAccessToken | IRefreshToken | IEmailToken,
  >(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new BadRequestException(ResultsEnum.TokenExpired.toString());
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new BadRequestException(ResultsEnum.InvalidToken.toString());
      }
      throw new InternalServerErrorException(error);
    }
  }

  public async generateAuthTokens(
    user: User & { credentials: Credentials },
    domain?: string,
    token_id?: string,
  ): Promise<[string, string]> {
    return Promise.all([
      this.generateToken(user, TokenTypeEnum.ACCESS, domain, token_id),
      this.generateToken(user, TokenTypeEnum.REFRESH, domain, token_id),
    ]);
  }
}
