import { PASSWORD_REGEX } from '../../common/regex.const';
import { IsString, Length, Matches, MinLength } from 'class-validator';
import { ResultsEnum } from '../../common/results.enum';

export abstract class PasswordsDto {
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message: ResultsEnum.PasswordRegex,
  })
  public password!: string;

  @IsString()
  @MinLength(8)
  public password_confirmation!: string;
}
