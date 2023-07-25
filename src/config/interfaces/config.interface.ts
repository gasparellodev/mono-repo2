import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { ThrottlerModuleOptions } from '@nestjs/throttler';

import { IEmailConfig } from './email-config.interface';
import { IJwt } from './jwt.interface';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  corsOrigin: string;
  db: MikroOrmModuleOptions;
  jwt: IJwt;
  emailService: IEmailConfig;
  redis: string;
  throttler: ThrottlerModuleOptions;
}
