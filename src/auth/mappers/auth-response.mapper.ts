import { ApiProperty } from '@nestjs/swagger';

import { AuthResponseUserMapper } from './auth-response-user.mapper';
import { IAuthResponse } from '../interfaces/auth-response.interface';
import { IAuthResult } from '../interfaces/auth-result.interface';

export class AuthResponseMapper implements IAuthResponse {
  @ApiProperty({
    description: 'User',
    type: AuthResponseUserMapper,
  })
  public user: AuthResponseUserMapper;

  @ApiProperty({
    description: 'Access token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    type: String,
  })
  public access_token: string;

  constructor(values: IAuthResponse) {
    Object.assign(this, values);
  }

  public static map(result: IAuthResult): AuthResponseMapper {
    return new AuthResponseMapper({
      user: AuthResponseUserMapper.map(result.user),
      access_token: result.access_token,
    });
  }
}
