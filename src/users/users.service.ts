import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Credentials, User } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import dayjs from 'dayjs';

import { ChangeEmailDto } from './dtos/change-email.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { FavoriteSport } from './enums/favorite-sport.enum';
import { FavoriteTime } from './enums/favorite-time.enum';
import { OauthProvidersEnum } from './enums/oauth-providers.enum';
import { Role } from './enums/role.enum';
import { ICreateUser } from './interfaces/create-user.interface';
import { IFindCreateUser } from './interfaces/find-create-user.interface';
import { CommonService } from '../common/common.service';
import { ResultsEnum } from '../common/results.enum';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { PrismaService } from '../prisma.service';

type FieldFunction<T> = (value: T) => Promise<void> | void;
@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commonService: CommonService,
  ) {}

  public async create({
    provider,
    name,
    email,
    password,
    favorite_sport,
    favorite_time,
    nickname,
    cellphone,
    role,
  }: ICreateUser): Promise<User & { credentials: Credentials }> {
    const isConfirmed = provider !== OauthProvidersEnum.LOCAL;
    const formattedEmail = email.toLowerCase();
    await this.checkEmailUnique(email);
    const formattedName = this.commonService.formatName(name);

    //TODO: REVISAR LOGICA DAS CREDENCIAIS
    const user = await this.prisma.user.create({
      data: {
        email: formattedEmail,
        name: formattedName,
        username: await this.generateUsername(name),
        password_hash: isUndefined(password)
          ? 'UNSET'
          : await hash(password, 10),
        favorite_sport,
        favorite_time,
        nickname,
        cellphone,
        role,
        confirmed: isConfirmed,
        credentials: { create: {} },
      },
      include: { credentials: true, oauth_providers: true },
    });

    await this.createOAuthProvider(provider, user.id);

    return user;
  }

  private async createOAuthProvider(
    provider: OauthProvidersEnum,
    user_id: string,
  ) {
    return this.prisma.oAuthProvider.create({
      data: {
        provider,
        user_id,
      },
    });
  }

  public async findOrCreate({
    provider,
    email,
    name,
    password,
    favorite_sport,
    favorite_time,
    nickname,
    cellphone,
    role,
  }: IFindCreateUser) {
    const formattedEmail = email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: formattedEmail },
      include: {
        oauth_providers: true,
      },
    });

    if (isUndefined(user) || isNull(user)) {
      if (
        isUndefined(favorite_sport) ||
        isUndefined(favorite_time) ||
        isUndefined(cellphone) ||
        isUndefined(nickname)
      ) {
        //it is not possible to register users without all the data
        throw new BadRequestException();
      }
      return this.create({
        provider,
        name,
        password,
        favorite_sport,
        favorite_time,
        nickname,
        cellphone,
        email,
        role,
      });
    }

    if (
      isUndefined(user.oauth_providers.find((p) => p.provider === provider))
    ) {
      await this.createOAuthProvider(provider, user.id);
    }

    return user;
  }

  public async confirmEmail(
    userId: string,
    version: number,
  ): Promise<User & { credentials: Credentials }> {
    const user = await this.findOneByCredentials(userId, version);

    if (user.confirmed) {
      throw new BadRequestException(
        ResultsEnum.EmailAlreadyConfirmed.toString(),
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        confirmed: true,
        credentials: {
          update: {
            version: user.credentials.version + 1,
            updated_at: dayjs().toDate(),
          },
        },
      },
    });

    return user;
  }

  /**
   * Checks whether the specified email address is unique among all users.
   *
   * @async
   * @private
   * @param {string} email - The email address to be checked for uniqueness.
   * @throws {ConflictException} If the email address is not unique.
   */
  private async checkEmailUnique(email: string): Promise<void> {
    const count = await this.prisma.user.count({ where: { email } });

    if (count > 0) {
      throw new ConflictException(ResultsEnum.EmailAlreadyInUse.toString());
    }
  }

  /**
   * Generates a unique username based on the specified name.
   *
   * @async
   * @private
   * @param {string} name - The name to be used for generating the username.
   * @returns {Promise<string>} A promise that resolves to the generated username.
   */
  private async generateUsername(name: string): Promise<string> {
    const pointSlug = this.commonService.generatePointSlug(name);
    const count = await this.prisma.user.count({
      where: {
        username: {
          startsWith: name,
          mode: 'insensitive',
        },
      },
    });

    if (count > 0) {
      return `${pointSlug}${count}`;
    }

    return pointSlug;
  }

  /**
   * Finds a user entity by its ID.
   *
   * @async
   * @param {string} id - The ID of the user to be found.
   * @returns {Promise<UserEntity>} A promise that resolves to the found user entity.
   * @throws {NotFoundException} If the user is not found.
   */
  public async findOneById(
    id: string,
  ): Promise<User & { credentials: Credentials }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { credentials: true },
    });
    this.commonService.checkEntityExistence(user, 'User');
    return user;
  }

  /**
   * Finds a user entity by its email address.
   *
   * @async
   * @param {string} email - The email address of the user to be found.
   * @returns {Promise<UserEntity>} A promise that resolves to the found user entity.
   * @throws {UnauthorizedException} If the user is not found or is not authorized.
   */
  public async findOneByEmail(
    email: string,
  ): Promise<User & { credentials: Credentials }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { credentials: true },
    });
    this.throwUnauthorizedException(user);
    return user;
  }

  /**
   * Finds a user entity by its email address, without checking for authorization.
   *
   * @async
   * @param {string} email - The email address of the user to be found.
   * @returns {Promise<UserEntity>} A promise that resolves to the found user entity.
   */
  public async uncheckedUserByEmail(
    email: string,
  ): Promise<User & { credentials: Credentials }> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { credentials: true },
    });
  }

  /**
   * Throws an unauthorized exception if the specified user is null or undefined.
   *
   * @private
   * @param {UserEntity | undefined | null} user - The user to be checked for authorization.
   * @throws {UnauthorizedException} If the user is not authorized.
   */
  private throwUnauthorizedException(user: undefined | null | User): void {
    if (isUndefined(user) || isNull(user)) {
      throw new UnauthorizedException(
        ResultsEnum.InvalidCredentials.toString(),
      );
    }
  }

  /**
   * Finds a user entity by its credentials.
   *
   * @async
   * @param {string} id - The ID of the user to be found.
   * @param {number} version - The version of the user's credentials to be verified.
   * @returns {Promise<UserEntity>} A promise that resolves to the found user entity.
   * @throws {UnauthorizedException} If the user is not found or is not authorized.
   */
  public async findOneByCredentials(
    id: string,
    version: number,
  ): Promise<User & { credentials: Credentials }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { credentials: true },
    });
    this.throwUnauthorizedException(user);

    if (user.credentials.version !== version) {
      throw new UnauthorizedException(
        ResultsEnum.InvalidCredentials.toString(),
      );
    }

    return user;
  }

  /**
   * Finds a user entity by its username.
   *
   * @async
   * @param {string} username - The username of the user to be found.
   * @param {boolean} forAuth - Indicates whether the function is being called for authentication purposes.
   * @returns {Promise<UserEntity>} A promise that resolves to the found user entity.
   * @throws {UnauthorizedException} If the user is not found or is not authorized.
   */
  public async findOneByUsername(
    username: string,
    forAuth = false,
  ): Promise<User & { credentials: Credentials }> {
    const user = await this.prisma.user.findFirst({
      where: { username: username.toLowerCase() },
      include: { credentials: true },
    });

    if (forAuth) {
      this.throwUnauthorizedException(user);
    } else {
      this.commonService.checkEntityExistence(user, 'User');
    }

    return user;
  }

  /**
   * Updates the information of a user with the specified ID.
   *
   * @async
   * @param id
   * @param {UpdateUserDto} dto - The DTO containing the updated information for the user.
   * @returns {Promise<UserEntity>} A promise that resolves to the updated user entity.
   * @throws {BadRequestException} If any of the updated information is invalid or already in use.
   */
  public async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(id);

    const fieldMap: { [key: string]: FieldFunction<any> } = {
      name: (value: string) => {
        if (value === user.name) {
          throw new BadRequestException(
            ResultsEnum.NameMustBeDifferent.toString(),
          );
        }
        user.name = this.commonService.formatName(value);
      },
      username: async (value: string) => {
        const formattedUsername = value.toLowerCase();
        if (user.username === formattedUsername) {
          throw new BadRequestException(
            ResultsEnum.UsernameMustBeDifferent.toString(),
          );
        }
        await this.checkUserNameUnique(formattedUsername);
        user.username = formattedUsername;
      },
      favorite_sport: (value: FavoriteSport) => {
        if (user.favorite_sport === value) {
          throw new BadRequestException(
            ResultsEnum.FavoriteSportMustBeDifferent.toString(),
          );
        }
        user.favorite_sport = value;
      },
      favorite_time: (value: FavoriteTime) => {
        if (user.favorite_time === value) {
          throw new BadRequestException(
            ResultsEnum.FavoriteTimeMustBeDifferent.toString(),
          );
        }
        user.favorite_time = value;
      },
      nickname: (value: string) => {
        if (user.nickname === value) {
          throw new BadRequestException(
            ResultsEnum.NicknameMustBeDifferent.toString(),
          );
        }
        user.nickname = value;
      },
      cellphone: (value: string) => {
        if (user.cellphone === value) {
          throw new BadRequestException(
            ResultsEnum.CellphoneMustBeDifferent.toString(),
          );
        }
        user.cellphone = value;
      },
      avatar: (value: string) => {
        if (user.avatar === value) {
          throw new BadRequestException(
            ResultsEnum.AvatarMustBeDifferent.toString(),
          );
        }
        user.avatar = value;
      },
      role: (value: Role) => {
        if (user.role === value) {
          throw new BadRequestException(
            ResultsEnum.RoleMustBeDifferent.toString(),
          );
        }
        user.role = value;
      },
    };

    for (const [field, value] of Object.entries(dto)) {
      if (!isUndefined(value) && !isNull(value) && fieldMap[field]) {
        await fieldMap[field](value);
      }
    }

    await this.prisma.user.update({
      where: { id },
      data: { ...user, credentials: {} },
    });
    return user;
  }

  /**
   * Checks if the specified username is unique.
   *
   * @async
   * @param {string} username - The username to be checked for uniqueness.
   * @throws {ConflictException} If the username is already in use by another user.
   */
  private async checkUserNameUnique(username: string): Promise<void> {
    const count = await this.prisma.user.count({ where: { username } });

    if (count > 0) {
      throw new ConflictException(ResultsEnum.UsernameAlreadyInUse.toString());
    }
  }

  /**
   * Updates the email of a user with the specified ID.
   *
   * @async
   * @param {string} userId - The ID of the user whose email is to be updated.
   * @param {ChangeEmailDto} dto - The DTO containing the new email and the user's password.
   * @returns {Promise<UserEntity>} A promise that resolves to the updated user entity.
   * @throws {BadRequestException} If the provided password is invalid or the new email is already in use.
   */
  public async updateEmail(userId: string, dto: ChangeEmailDto): Promise<User> {
    const user = await this.findOneById(userId);
    const { email, password } = dto;

    if (!(await compare(password, user.password_hash))) {
      throw new BadRequestException(ResultsEnum.InvalidPassword.toString());
    }

    const formattedEmail = email.toLowerCase();
    await this.checkEmailUnique(formattedEmail);
    user.credentials.version++;
    user.credentials.updated_at = dayjs().toDate();
    user.email = formattedEmail;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...user,
        credentials: {
          update: { ...user.credentials },
        },
      },
    });
    return user;
  }

  /**
   * Updates the password of a user with the specified ID.
   *
   * @async
   * @param {string} userId - The ID of the user whose password is to be updated.
   * @param {string} password - The current password of the user.
   * @param {string} newPassword - The new password to be set for the user.
   * @returns {Promise<UserEntity>} A promise that resolves to the updated user entity.
   * @throws {BadRequestException} If the current password is invalid or the new password is the same as the current password.
   */
  public async updatePassword(
    userId: string,
    password: string,
    newPassword: string,
  ): Promise<User & { credentials: Credentials }> {
    const user = await this.findOneById(userId);

    if (user.password_hash === 'UNSET') {
      await this.createOAuthProvider(OauthProvidersEnum.LOCAL, user.id);
    } else {
      if (!(await compare(password, user.password_hash))) {
        throw new BadRequestException(ResultsEnum.InvalidPassword.toString());
      }
      if (await compare(newPassword, user.password_hash)) {
        throw new BadRequestException(
          ResultsEnum.NewPasswordMustBeDifferent.toString(),
        );
      }
    }

    const newPasswordHash = await hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        credentials: {
          update: {
            last_password: user.password_hash,
            version: user.credentials.version + 1,
            password_updated_at: dayjs().toDate(),
            updated_at: dayjs().toDate(),
          },
        },
      },
      include: { credentials: true },
    });
  }

  /**
   * Resets the password of a user with the specified ID and version.
   *
   * @async
   * @param {string} userId - The ID of the user whose password is to be reset.
   * @param {number} version - The version of the user credentials to be updated.
   * @param {string} password - The new password to be set for the user.
   * @returns {Promise<UserEntity>} A promise that resolves to the updated user entity.
   */
  public async resetPassword(
    userId: string,
    version: number,
    password: string,
  ): Promise<User> {
    const user = await this.findOneByCredentials(userId, version);

    const newCredentials: Credentials = { ...user.credentials };
    newCredentials.last_password = user.password_hash;
    newCredentials.version++;
    newCredentials.password_updated_at = dayjs().toDate();
    newCredentials.updated_at = dayjs().toDate();
    const newPasswordHash = await hash(password, 10);

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        password_hash: newPasswordHash,
        credentials: {
          update: {
            ...newCredentials,
          },
        },
      },
    });
  }

  /**
   * Removes a user with the specified ID from the database.
   *
   * @async
   * @param {string} userId - The ID of the user to be removed.
   * @returns {Promise<UserEntity>} A promise that resolves to the removed user entity.
   */
  public async remove(userId: string): Promise<User> {
    return this.prisma.user.delete({ where: { id: userId } });
  }
}
