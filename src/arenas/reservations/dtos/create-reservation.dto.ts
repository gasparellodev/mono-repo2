import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsDateString, IsString } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Data e hora do agendamento',
    type: Date,
  })
  @IsDateString()
  public date!: string;

  @ApiProperty({
    description: 'UUID da quadra escolhida pelo usuário',
    type: String,
  })
  public court_id!: string;
}
