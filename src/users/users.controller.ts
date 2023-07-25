import { Body, Controller, Patch, Req } from '@nestjs/common';
import { User } from '@prisma/client';
import { Request } from 'express-serve-static-core';

import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  public async update(
    @Req() req: Request,
    @Body() data: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(req.user, data);
  }
}
