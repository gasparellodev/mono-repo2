import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Credentials, User } from '@prisma/client';
import { compare } from 'bcrypt';
import { isEmail } from 'class-validator';
import dayjs from 'dayjs';

import { ChangePasswordDto } from './dtos/change-password.dto';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { EmailDto } from './dtos/email.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { IAuthResult } from './interfaces/auth-result.interface';
import { CommonService } from '../common/common.service';
import { IMessage } from '../common/interfaces/message.interface';
import { SLUG_REGEX } from '../common/regex.const';
import { ResultsEnum } from '../common/results.enum';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { TokenTypeEnum } from '../jwt/enums/token-type.enum';
import { IEmailToken } from '../jwt/interfaces/email-token.interface';
import { IRefreshToken } from '../jwt/interfaces/refresh-token.interface';
import { JwtService } from '../jwt/jwt.service';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma.service';
import { OauthProvidersEnum } from '../users/enums/oauth-providers.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  public async signUp(dto: SignUpDto, domain?: string): Promise<IMessage> {
    const {
      name,
      email,
      password,
      password_confirmation,
      favorite_sport,
      favorite_time,
      nickname,
      cellphone,
      role,
    } = dto;
    this.comparePasswords(password, password_confirmation);
    const user = await this.usersService.create({
      provider: OauthProvidersEnum.LOCAL,
      email,
      name,
      password,
      favorite_time,
      favorite_sport,
      nickname,
      cellphone,
      role: role ?? undefined,
    });
    const confirmationToken = await this.jwtService.generateToken(
      user,
      TokenTypeEnum.CONFIRMATION,
      domain,
    );
    this.mailerService.sendConfirmationEmail(user, confirmationToken);
    return this.commonService.generateMessage(
      ResultsEnum.RegistrationSuccessful,
    );
  }

  public async confirmEmail(
    dto: ConfirmEmailDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const { confirmationToken } = dto;
    const { id, version } = await this.jwtService.verifyToken<IEmailToken>(
      confirmationToken,
      TokenTypeEnum.CONFIRMATION,
    );
    const user = await this.usersService.confirmEmail(id, version);
    const [access_token, refresh_token] =
      await this.jwtService.generateAuthTokens(user, domain);
    return { user, access_token, refresh_token };
  }

  private comparePasswords(password: string, confirm_password: string): void {
    if (password !== confirm_password) {
      throw new BadRequestException(ResultsEnum.PasswordDoNotMatch.toString());
    }
  }

  public async signIn(dto: SignInDto, domain?: string): Promise<IAuthResult> {
    const { emailOrUsername, password } = dto;
    const user = await this.userByEmailOrUsername(emailOrUsername);

    if (!(await compare(password, user.password_hash))) {
      await this.checkLastPassword(user.credentials, password);
    }
    if (!user.confirmed) {
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.CONFIRMATION,
        domain,
      );
      this.mailerService.sendConfirmationEmail(user, confirmationToken);
      throw new UnauthorizedException(
        ResultsEnum.PleaseConfirmYourEmail.toString(),
      );
    }

    const [access_token, refresh_token] =
      await this.jwtService.generateAuthTokens(user, domain);
    return { user, access_token, refresh_token };
  }

  private async userByEmailOrUsername(
    emailOrUsername: string,
  ): Promise<User & { credentials: Credentials }> {
    if (emailOrUsername.includes('@')) {
      if (!isEmail(emailOrUsername)) {
        throw new BadRequestException(ResultsEnum.InvalidEmail.toString());
      }

      return this.usersService.findOneByEmail(emailOrUsername);
    }

    if (
      emailOrUsername.length < 3 ||
      emailOrUsername.length > 106 ||
      !SLUG_REGEX.test(emailOrUsername)
    ) {
      throw new BadRequestException(ResultsEnum.InvalidUserName.toString());
    }

    return this.usersService.findOneByUsername(emailOrUsername, true);
  }

  private async checkLastPassword(
    credentials: Credentials,
    password: string,
  ): Promise<void> {
    const { last_password, password_updated_at } = credentials;

    if (
      last_password.length === 0 ||
      !(await compare(password, last_password))
    ) {
      throw new UnauthorizedException(
        ResultsEnum.InvalidCredentials.toString(),
      );
    }

    const now = dayjs();
    const time = dayjs(password_updated_at).unix();
    const months = now.diff(time, 'month');
    const message = ResultsEnum.YouChangedYourPassword.toString();

    if (months > 0) {
      throw new UnauthorizedException(
        message +
          months +
          (months > 1
            ? ' ' + ResultsEnum.MonthsAgo.toString()
            : ' ' + ResultsEnum.MonthAgo.toString()),
      );
    }

    const days = now.diff(time, 'day');

    if (days > 0) {
      throw new UnauthorizedException(
        message +
          days +
          (days > 1
            ? ' ' + ResultsEnum.DaysAgo.toString()
            : ' ' + ResultsEnum.DayAgo.toString()),
      );
    }

    const hours = now.diff(time, 'hour');

    if (hours > 0) {
      throw new UnauthorizedException(
        message +
          hours +
          (hours > 1
            ? ' ' + ResultsEnum.HoursAgo.toString()
            : ' ' + ResultsEnum.HourAgo.toString()),
      );
    }

    throw new UnauthorizedException(message + ResultsEnum.Recently.toString());
  }

  public async refreshTokenAccess(
    refresh_token: string,
    domain?: string,
  ): Promise<IAuthResult> {
    const { id, version, token_id } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refresh_token,
        TokenTypeEnum.REFRESH,
      );
    await this.checkIfTokenIsBlacklisted(id, token_id);
    const user = await this.usersService.findOneByCredentials(id, version);
    const [access_token, new_refresh_token] =
      await this.jwtService.generateAuthTokens(user, domain, token_id);
    return { user, access_token, refresh_token: new_refresh_token };
  }

  private async checkIfTokenIsBlacklisted(
    user_id: string,
    token_id: string,
  ): Promise<void> {
    const count = await this.prisma.blacklistToken.count({
      where: {
        user_id,
        token_id,
      },
    });

    if (count > 0) {
      throw new UnauthorizedException(ResultsEnum.InvalidToken.toString());
    }
  }

  public async logout(refreshToken: string): Promise<IMessage> {
    const { id, token_id } = await this.jwtService.verifyToken<IRefreshToken>(
      refreshToken,
      TokenTypeEnum.REFRESH,
    );
    await this.blacklistToken(id, token_id);
    return this.commonService.generateMessage(
      ResultsEnum.LogoutSuccessful.toString(),
    );
  }

  private async blacklistToken(user_id: string, token_id: string) {
    try {
      await this.prisma.blacklistToken.create({
        data: {
          user_id,
          token_id,
        },
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  public async resetPasswordEmail(
    dto: EmailDto,
    domain?: string,
  ): Promise<IMessage> {
    const user = await this.usersService.uncheckedUserByEmail(dto.email);

    if (!isUndefined(user) && !isNull(user)) {
      const resetToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.RESET_PASSWORD,
        domain,
      );
      this.mailerService.sendResetPasswordEmail(user, resetToken);
    }

    return this.commonService.generateMessage(
      ResultsEnum.ResetPasswordEmailSent.toString(),
    );
  }

  public async resetPassword(dto: ResetPasswordDto): Promise<IMessage> {
    const { password, password_confirmation, reset_token } = dto;
    const { id, version } = await this.jwtService.verifyToken<IEmailToken>(
      reset_token,
      TokenTypeEnum.RESET_PASSWORD,
    );
    this.comparePasswords(password, password_confirmation);
    await this.usersService.resetPassword(id, version, password);
    return this.commonService.generateMessage(
      ResultsEnum.PasswordRestSuccessful.toString(),
    );
  }

  public async changePassword(
    user_id: string,
    dto: ChangePasswordDto,
    domain?: string,
  ): Promise<IAuthResult> {
    const { password, password_confirmation, last_password } = dto;
    this.comparePasswords(password, password_confirmation);
    const user = await this.usersService.updatePassword(
      user_id,
      last_password,
      password,
    );
    const [access_token, refresh_token] =
      await this.jwtService.generateAuthTokens(user, domain);
    return { user, access_token, refresh_token };
  }
}
