import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { WeekDays } from '../enums/week-days.enum';

export class CreateOpeningHoursDto {
  @ApiProperty({
    enum: WeekDays,
    description: 'Dia da semana',
    example: 'SATURDAY',
  })
  @IsEnum(WeekDays)
  public week_day!: WeekDays;

  @ApiProperty({
    description: 'Horário da abertura',
    type: Number,
    example: '8',
  })
  @IsNumber()
  public opening!: number;

  @ApiProperty({
    description: 'Horário da fechamento',
    type: Number,
    example: '18',
  })
  @IsNumber()
  public closing!: number;

  @ApiProperty({
    description: 'UUID da arena que será definido os horários',
    type: String,
  })
  @IsString()
  public arena_id: string;

  @ApiProperty({
    description: 'Horário da fechamento para almoco',
    type: Number,
    example: '12',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public lunch_closing?: number;

  @ApiProperty({
    description: 'Horário da abertura pós almoco',
    type: Number,
    example: '14',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  public lunch_opening?: number;
}
