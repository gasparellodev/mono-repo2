import { FavoriteSport } from '../../users/enums/favorite-sport.enum';
import { FavoriteTime } from '../../users/enums/favorite-time.enum';
import { Role } from '../../users/enums/role.enum';
import { ICredentials } from '../../users/interfaces/credentials.interface';

export interface IAuthResponseUser {
  id: string;
  name: string;
  username: string;
  nickname: string;
  email: string;
  cpf?: string;
  cellphone: string;
  favorite_sport: string;
  favorite_time: string;
  avatar?: string;
  role?: Role;
  created_at: string;
  updated_at: string;
}
