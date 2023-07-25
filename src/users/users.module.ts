import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  providers: [UsersService, PrismaService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
