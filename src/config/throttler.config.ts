import { Injectable } from '@nestjs/common';
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { RedisOptions } from 'ioredis';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      ...this.configService.get<ThrottlerModuleOptions>('throttler'),
      storage: new ThrottlerStorageRedisService(
        this.configService.get<RedisOptions>('redis'),
      ),
    };
  }
}
