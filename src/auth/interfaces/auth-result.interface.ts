import { User } from '@prisma/client';

export interface IAuthResult {
  user: User;
  access_token: string;
  refresh_token: string;
}
