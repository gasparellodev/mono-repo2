import { ExecutionContext, createParamDecorator } from '@nestjs/common';
// eslint-disable-next-line import/no-unresolved
import { Request } from 'express-serve-static-core';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    return context.switchToHttp().getRequest<Request>()?.user;
  },
);
