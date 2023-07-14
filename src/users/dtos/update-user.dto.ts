import { IsEnum, IsString, Length, Matches, ValidateIf } from 'class-validator';
import { NAME_REGEX, SLUG_REGEX } from '../../common/regex.const';
import { isUndefined } from '@nestjs/common/utils/shared.utils';
import { isNull } from '../../common/utils/validation.util';
import { FavoriteSport } from '../enums/favorite-sport.enum';
import { FavoriteTime } from '../enums/favorite-time.enum';
import { Role } from '../enums/role.enum';

export abstract class UpdateUserDto {
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  @ValidateIf(
    (o: UpdateUserDto) =>
      !isUndefined(o.username) || isUndefined(o.name) || isNull(o.name),
  )
  public username?: string;

  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  @ValidateIf(
    (o: UpdateUserDto) =>
      !isUndefined(o.name) || isUndefined(o.username) || isNull(o.username),
  )
  public name?: string;

  @IsString()
  public avatar?: string;

  @IsEnum(FavoriteSport)
  public favorite_sport?: FavoriteSport;

  @IsEnum(FavoriteTime)
  public favorite_time?: FavoriteTime;

  @IsString()
  @Length(9, 12)
  public cellphone?: string;

  @IsString()
  @Length(3, 100)
  public nickname?: string;

  @IsEnum(Role)
  public role?: Role;
}
