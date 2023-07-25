import { Embeddable, Property } from '@mikro-orm/core';
import dayjs from 'dayjs';

import { ICredentials } from '../interfaces/credentials.interface';

@Embeddable()
export class CredentialsEmbeddable implements ICredentials {
  @Property({ default: 0 })
  public version = 0;

  @Property({ default: '' })
  public last_password = '';

  @Property({ default: dayjs().unix() })
  public password_updated_at: number = dayjs().unix();

  @Property({ default: dayjs().unix() })
  public updated_at: number = dayjs().unix();

  public updatePassword(password: string): void {
    this.version++;
    this.last_password = password;
    const now = dayjs().unix();
    this.password_updated_at = now;
    this.updated_at = now;
  }

  public updateVersion(): void {
    this.version++;
    this.updated_at = dayjs().unix();
  }
}
