import { isUndefined } from '@nestjs/common/utils/shared.utils';
import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator';

import { NAME_REGEX, SLUG_REGEX } from '../../common/regex.const';
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
  @IsOptional()
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
  @IsOptional()
  public name?: string;

  @IsString()
  @IsOptional()
  public avatar?: string;

  @IsEnum(FavoriteSport)
  @IsOptional()
  public favorite_sport?: FavoriteSport;

  @IsEnum(FavoriteTime)
  @IsOptional()
  public favorite_time?: FavoriteTime;

  @IsString()
  @Length(9, 12)
  @IsOptional()
  public cellphone?: string;

  @IsString()
  @Length(3, 100)
  @IsOptional()
  public nickname?: string;

  @IsEnum(Role)
  @IsOptional()
  public role?: Role;
}
