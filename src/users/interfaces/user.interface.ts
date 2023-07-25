import { FavoriteSport } from '../enums/favorite-sport.enum';
import { FavoriteTime } from '../enums/favorite-time.enum';
import { Role } from '../enums/role.enum';
import { ICredentials } from './credentials.interface';

export interface IUser {
  id: string;
  name: string;
  username: string;
  nickname: string;
  email: string;
  password_hash: string;
  credentials: ICredentials;
  cpf?: string;
  cellphone: string;
  favorite_sport: FavoriteSport;
  favorite_time: FavoriteTime;
  avatar?: string;
  role?: Role;
  created_at: Date;
  updated_at: Date;
}
