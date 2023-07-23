import { ApiProperty } from '@nestjs/swagger';
import { v4 } from 'uuid';

import { ReservationStatus } from '../enums/reservation-status.enum';
import { FindByUserResponse } from '../interfaces/find-by-user.response.interface';

export class FindByUserMapper {
  @ApiProperty({
    description: 'Id da reserva',
    example: v4().toString(),
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Data da reserva',
    example: new Date(),
    type: Date,
  })
  public date: Date;

  @ApiProperty({
    description: 'Nome da quadra',
    example: 'Quadra 1',
    type: String,
  })
  public court: string;

  @ApiProperty({
    description: 'Id da quadra',
    example: v4().toString(),
    type: String,
  })
  public court_id: string;

  @ApiProperty({
    description: 'Nome da arena',
    example: 'Arena 1',
    type: String,
  })
  public arena: string;

  @ApiProperty({
    description: 'Id da arena',
    example: v4().toString(),
    type: String,
  })
  public arena_id: string;

  @ApiProperty({
    description: 'Status da reserva',
    enum: ReservationStatus,
  })
  public status: ReservationStatus;

  constructor(values: FindByUserResponse) {
    Object.assign(this, values);
  }

  public static map(result: FindByUserResponse): FindByUserMapper {
    return new FindByUserMapper({
      id: result.id,
      date: result.date,
      court: result.court,
      court_id: result.court_id,
      sport_type: result.sport_type,
      arena: result.arena,
      arena_id: result.arena_id,
      status: result.status,
    });
  }
}
