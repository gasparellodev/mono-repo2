import { ApiOkResponse, ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class EnableNotificationDto {
  @ApiProperty({
    description: 'Token do dispositivo',
    example: '0000-0000-0000-0000',
    type: String,
  })
  @IsString()
  public token: string;
  @ApiProperty({
    description: 'Tipo do dispositivo',
    example: '0000-0000-0000-0000',
    type: String,
  })
  @IsString()
  public device_type: string;
}
