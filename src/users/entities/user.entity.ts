import { IUser } from '../interfaces/user.interface';
import { FavoriteSport } from '../enums/favorite-sport.enum';
import { FavoriteTime } from '../enums/favorite-time.enum';
import { Role } from '../enums/role.enum';
import { Embedded, Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { BCRYPT_HASH, NAME_REGEX, SLUG_REGEX } from '../../common/regex.const';
import { CredentialsEmbeddable } from '../embeddables/credentials.embeddable';

@Entity({ tableName: 'users' })
export class UserEntity implements IUser {
  @PrimaryKey()
  public id: string = v4();

  @Property({ columnType: 'varchar', length: 100 })
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'NAME_NOT_VALID',
  })
  public name: string;

  @Property({ columnType: 'varchar', length: 100 })
  @IsString()
  @Length(3, 100)
  public nickname: string;

  @Property({ columnType: 'varchar', length: 106 })
  @IsString()
  @Length(3, 100)
  @Matches(SLUG_REGEX, { message: 'USERNAME_NOT_VALID' })
  public username: string;

  @Property({ columnType: 'varchar', length: 12 })
  @IsString()
  @Length(9, 12)
  public cellphone: string;

  @Property({ columnType: 'varchar', length: 255 })
  @IsString()
  @IsEmail()
  @Length(8, 255)
  public email: string;

  @Property({ columnType: 'varchar', length: 60 })
  @IsString()
  @Length(59, 60)
  @Matches(BCRYPT_HASH)
  public password_hash: string;

  @Embedded(() => CredentialsEmbeddable)
  public credentials: CredentialsEmbeddable = new CredentialsEmbeddable();

  @Property({ columnType: 'varchar', length: 255, nullable: true })
  @IsString()
  @IsOptional()
  public avatar?: string;

  @Property({ columnType: 'varchar', length: 11, nullable: true })
  @IsString()
  @Length(11, 11)
  @IsOptional()
  public cpf?: string;

  @Enum(() => FavoriteSport)
  public favorite_sport: FavoriteSport;

  @Enum(() => FavoriteTime)
  public favorite_time: FavoriteTime;

  @Property({ columnType: 'boolean', default: false })
  @IsBoolean()
  public confirmed: true | false = false;

  @Enum(() => Role)
  public role: Role = Role.Player;

  @Property({ onCreate: () => new Date() })
  public created_at: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  public updated_at: Date = new Date();
}
