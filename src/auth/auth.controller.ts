import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express-serve-static-core';

import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Origin } from './decorators/origin.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { IAuthResponseUser } from './interfaces/auth-response-user.interface';
import { AuthResponseUserMapper } from './mappers/auth-response-user.mapper';
import { AuthResponseMapper } from './mappers/auth-response.mapper';
import { IMessage } from '../common/interfaces/message.interface';
import { isUndefined } from '../common/utils/validation.util';
import { UsersService } from '../users/users.service';

@Controller('api/auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  private readonly cookiePath = '/api/auth';
  private readonly cookieName: string;
  private readonly refreshTime: number;
  private readonly testing: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('REFRESH_COOKIE');
    this.refreshTime = this.configService.get<number>('jwt.refresh.time');
    this.testing = this.configService.get<string>('NODE_ENV') !== 'production';
  }

  @Public()
  @Post('/sign-up')
  public async signUp(
    @Origin() origin: string | undefined,
    @Body() signUpDto: SignUpDto,
  ): Promise<IMessage> {
    return this.authService.signUp(signUpDto, origin);
  }

  @Public()
  @Post('/sign-in')
  @ApiOkResponse({
    type: AuthResponseMapper,
    description: 'Logs in the user and returns the access token',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials or User is not confirmed',
  })
  public async signIn(
    @Res() res: Response,
    @Origin() origin: string | undefined,
    @Body() singInDto: SignInDto,
  ): Promise<void> {
    const result = await this.authService.signIn(singInDto, origin);
    this.saveRefreshCookie(res, result.refresh_token)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Public()
  @Post('/refresh-access')
  public async refreshAccess(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const result = await this.authService.refreshTokenAccess(
      token,
      req.headers.origin,
    );
    this.saveRefreshCookie(res, result.refresh_token)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  public async logout(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const token = this.refreshTokenFromReq(req);
    const message = await this.authService.logout(token);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.OK)
      .json(message);
  }

  @Public()
  @Post('/confirm-email')
  public async confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.confirmEmail(confirmEmailDto);
    this.saveRefreshCookie(res, result.refresh_token)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Post('/forgot-password')
  @HttpCode(HttpStatus.OK)
  public async forgotPassword(
    @Origin() origin: string | undefined,
    @Body() emailDto: EmailDto,
  ): Promise<IMessage> {
    return this.authService.resetPasswordEmail(emailDto, origin);
  }

  @Public()
  @Post('/reset-password')
  @HttpCode(HttpStatus.OK)
  public async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<IMessage> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Patch('/update-password')
  public async updatePassword(
    @CurrentUser() user_id: string,
    @Origin() origin: string | undefined,
    @Body() changePasswordDto: ChangePasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    const result = await this.authService.changePassword(
      user_id,
      changePasswordDto,
      origin,
    );
    this.saveRefreshCookie(res, result.refresh_token)
      .status(HttpStatus.OK)
      .json(AuthResponseMapper.map(result));
  }

  @Get('/me')
  public async getMe(@CurrentUser() id: string): Promise<IAuthResponseUser> {
    const user = await this.usersService.findOneById(id);
    return AuthResponseUserMapper.map(user);
  }

  private refreshTokenFromReq(req: Request): string {
    const token: string | undefined = req.signedCookies[this.cookieName];

    if (isUndefined(token)) {
      throw new UnauthorizedException();
    }

    return token;
  }

  private saveRefreshCookie(res: Response, refreshToken: string): Response {
    return res.cookie(this.cookieName, refreshToken, {
      secure: !this.testing,
      httpOnly: true,
      signed: true,
      path: this.cookiePath,
      expires: new Date(Date.now() + this.refreshTime * 1000),
    });
  }
}
