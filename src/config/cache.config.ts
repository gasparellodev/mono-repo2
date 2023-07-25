import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      store: await redisStore({
        url: this.configService.get<string>('redis'),
        ttl: this.configService.get<number>('jwt.refresh.time') * 1000,
      }),
    };
  }
}
