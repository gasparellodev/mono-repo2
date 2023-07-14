import { IUser } from '../../users/interfaces/user.interface';

export interface IBlacklistedToken {
  token_id: string;
  user: IUser;
  created_at: Date;
}
