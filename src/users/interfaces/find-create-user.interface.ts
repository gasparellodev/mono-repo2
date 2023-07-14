import { FavoriteSport } from '../enums/favorite-sport.enum';
import { FavoriteTime } from '../enums/favorite-time.enum';
import { OauthProvidersEnum } from '../enums/oauth-providers.enum';
import { Role } from '../enums/role.enum';

export interface IFindCreateUser {
  provider: OauthProvidersEnum;
  name: string;
  password: string;
  email: string;
  favorite_sport?: FavoriteSport;
  favorite_time?: FavoriteTime;
  cellphone?: string;
  nickname?: string;
  role?: Role;
}
