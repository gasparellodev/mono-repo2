import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

import { FavoriteSport } from '../../users/enums/favorite-sport.enum';
import { FavoriteTime } from '../../users/enums/favorite-time.enum';
import { Role } from '../../users/enums/role.enum';
import { IAuthResponseUser } from '../interfaces/auth-response-user.interface';

export class AuthResponseUserMapper implements IAuthResponseUser {
  @ApiProperty({
    description: 'Id do usuário',
    example: '0000-0000-0000-0000',
    type: String,
  })
  public id: string;
  public name: string;
  public username: string;
  public email: string;
  public favorite_sport: FavoriteSport;
  public favorite_time: FavoriteTime;
  public avatar: string;
  public cpf: string;
  public role: Role;
  public cellphone: string;
  public nickname: string;
  public created_at: string;
  public updated_at: string;

  constructor(values: IAuthResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: User): AuthResponseUserMapper {
    return new AuthResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      favorite_sport: FavoriteSport[user.favorite_sport],
      favorite_time: FavoriteTime[user.favorite_time],
      avatar: user.avatar,
      cpf: user.cpf,
      role: Role[user.role],
      cellphone: user.cellphone,
      nickname: user.nickname,
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    });
  }
}
