import {
  Entity,
  ManyToOne,
  PrimaryKeyType,
  Property,
  Unique,
} from '@mikro-orm/core';
import { UserEntity } from '../../users/entities/user.entity';
import { IBlacklistedToken } from '../interfaces/blacklisted-token.interface';

@Entity({ tableName: 'blacklisted_tokens' })
@Unique({ properties: ['token_id', 'user'] })
export class BlacklistedTokenEntity implements IBlacklistedToken {
  @Property({
    primary: true,
    columnType: 'uuid',
  })
  public token_id: string;

  @ManyToOne({
    entity: () => UserEntity,
    onDelete: 'cascade',
    primary: true,
  })
  public user: UserEntity;

  @Property({ onCreate: () => new Date() })
  public created_at: Date;

  [PrimaryKeyType]: [string, string];
}
