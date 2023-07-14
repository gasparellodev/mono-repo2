import { Module } from '@nestjs/common';

import { CourtsController } from './courts.controller';
import { CourtsService } from './courts.service';
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [CourtsController],
  providers: [CourtsService, PrismaService],
})
export class CourtsModule {}
