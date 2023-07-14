import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArenasModule } from './arenas/arenas.module';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { config } from './config';
import { validationSchema } from './config/config.schema';
import { MikroOrmConfig } from './config/mikro-orm.config';
import { ThrottlerConfig } from './config/throttler.config';
import { JwtModule } from './jwt/jwt.module';
import { MailerModule } from './mailer/mailer.module';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { Oauth2Module } from './oauth2/oauth2.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [config],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MikroOrmConfig,
    }),
    // CacheModule.registerAsync({
    //   isGlobal: true,
    //   imports: [ConfigModule],
    //   useClass: CacheConfig,
    // }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ThrottlerConfig,
    }),
    CommonModule,
    UsersModule,
    JwtModule,
    MailerModule,
    AuthModule,
    ArenasModule,
    Oauth2Module,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
