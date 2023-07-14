import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsEnum, IsString } from 'class-validator';

import { SportType } from '../enum/sport-type.enum';
import { TypeCourt } from '../enum/type-court.enum';

export class CreateCourtDto {
  @ApiProperty({
    description: 'O nome da quadra',
    type: String,
    example: 'Quadra 01',
  })
  @IsString()
  public name!: string;

  @ApiProperty({
    enum: TypeCourt,
    description: 'Tipo do piso da quadra',
  })
  @IsEnum(TypeCourt)
  public type_court!: TypeCourt;

  @ApiProperty({
    enum: SportType,
    description: 'Tipo de esporte que é jogado na quadra',
  })
  @IsEnum(SportType)
  public sport_type!: SportType;

  @ApiProperty({
    type: String,
    description: 'Valor cobrado por hora agendada',
    example: '150,00',
  })
  @IsDecimal({
    decimal_digits: '2',
    locale: 'en-US',
  })
  public value_per_hour: string;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Condicional de quadra coberta',
  })
  @IsBoolean()
  public covered_court!: boolean;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Condicional possui timer digital',
  })
  @IsBoolean()
  public court_digital_timer!: boolean;

  @ApiProperty({
    type: Boolean,
    default: false,
    description: 'Condicional possui Cam Replay',
  })
  @IsBoolean()
  public court_cam_replay!: boolean;

  @ApiProperty({
    type: String,
    description: 'uuid da arena na qual a quadra pertence',
    example: '0000-0000-0000-000',
  })
  @IsString()
  public arena_id!: string;
}
