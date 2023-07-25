import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { StorageService } from './storage.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Public()
  @Post('store')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    const url = await this.storageService.upload(
      file.originalname,
      file.buffer,
    );

    return {
      url,
    };
  }
}
