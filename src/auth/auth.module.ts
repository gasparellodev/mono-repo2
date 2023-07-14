import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BlacklistedTokenEntity } from './entities/blacklisted-token.entity';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule } from '../jwt/jwt.module';
import { MailerModule } from '../mailer/mailer.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([BlacklistedTokenEntity]),
    UsersModule,
    JwtModule,
    MailerModule,
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
