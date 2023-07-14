import { ICredentials } from '../../users/interfaces/credentials.interface';
import { FavoriteSport } from '../../users/enums/favorite-sport.enum';
import { FavoriteTime } from '../../users/enums/favorite-time.enum';
import { Role } from '../../users/enums/role.enum';

export interface IAuthResponseUser {
  id: string;
  name: string;
  username: string;
  nickname: string;
  email: string;
  cpf?: string;
  cellphone: string;
  favorite_sport: FavoriteSport;
  favorite_time: FavoriteTime;
  avatar?: string;
  role?: Role;
  created_at: string;
  updated_at: string;
}
