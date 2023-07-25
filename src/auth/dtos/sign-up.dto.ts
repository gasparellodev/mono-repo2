import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

import { PasswordsDto } from './passwords.dto';
import { NAME_REGEX } from '../../common/regex.const';
import { ResultsEnum } from '../../common/results.enum';
import { FavoriteSport } from '../../users/enums/favorite-sport.enum';
import { FavoriteTime } from '../../users/enums/favorite-time.enum';
import { Role } from '../../users/enums/role.enum';

export abstract class SignUpDto extends PasswordsDto {
  @IsString()
  @Length(3, 100, {
    message: ResultsEnum.NameSize,
  })
  @Matches(NAME_REGEX, {
    message: ResultsEnum.NameRegex,
  })
  public name!: string;

  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email!: string;

  @IsEnum(FavoriteSport)
  public favorite_sport!: FavoriteSport;

  @IsEnum(FavoriteTime)
  public favorite_time!: FavoriteTime;

  @IsString()
  @Length(11, 12)
  public cellphone!: string;

  @IsString()
  @Length(3, 100)
  public nickname!: string;

  @IsEnum(FavoriteTime)
  @IsOptional()
  public role?: Role;
}
