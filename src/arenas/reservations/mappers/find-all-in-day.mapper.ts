import { ApiProperty } from '@nestjs/swagger';
import { v4 } from 'uuid';

import { SportType } from '../../courts/enum/sport-type.enum';
import {
  FindAllInDayAvailableTimes,
  FindAllInDayCourt,
  FindAllInDayResponse,
} from '../interfaces/find-all-in-day.response.interface';

class FindAllInDayAvailableTimesMapper {
  @ApiProperty({
    description: 'Horário disponível',
    example: 8,
    type: Number,
  })
  public hour: number;

  @ApiProperty({
    description: 'Se o horário está disponível',
    example: true,
    type: Boolean,
  })
  public available: boolean;

  constructor(values: FindAllInDayAvailableTimes) {
    Object.assign(this, values);
  }

  public static map(
    result: FindAllInDayAvailableTimes,
  ): FindAllInDayAvailableTimesMapper {
    return new FindAllInDayAvailableTimesMapper({
      hour: result.hour,
      available: result.available,
    });
  }
}

class FindAllInDayCourtMapper {
  public court: string;
  public court_id: string;
  public sport_type: SportType;
  public value_per_hour: number;
  @ApiProperty({
    description: 'Horários disponíveis',
    example: [
      {
        hour: 8,
        available: true,
      },
    ],
    type: [FindAllInDayAvailableTimesMapper],
  })
  public available_times: FindAllInDayAvailableTimesMapper[];

  constructor(values: FindAllInDayCourt) {
    Object.assign(this, values);
  }

  public static map(result: FindAllInDayCourt): FindAllInDayCourtMapper {
    return new FindAllInDayCourtMapper({
      court: result.court,
      court_id: result.court_id,
      sport_type: result.sport_type,
      value_per_hour: result.value_per_hour,
      available_times: result.available_times.map((availableTime) =>
        FindAllInDayAvailableTimesMapper.map(availableTime),
      ),
    });
  }
}

export class FindAllInDayMapper {
  @ApiProperty({
    description: 'Nome da arena',
    example: 'Arena 1',
    type: String,
  })
  public arena: string;

  @ApiProperty({
    description: 'Uuid da arena',
    example: v4().toString(),
    type: String,
  })
  public arena_id: string;

  @ApiProperty({
    description: 'Quadras da arena',
    example: [
      {
        court: 'Quadra 1',
        court_id: v4().toString(),
        available_times: [
          {
            hour: 8,
            available: true,
          },
        ],
      },
    ],
  })
  public courts: FindAllInDayCourtMapper[];

  constructor(values: FindAllInDayResponse) {
    Object.assign(this, values);
  }

  public static map(result: FindAllInDayResponse): FindAllInDayMapper {
    return new FindAllInDayMapper({
      arena: result.arena,
      arena_id: result.arena_id,
      courts: result.courts.map((court) => FindAllInDayCourtMapper.map(court)),
    });
  }
}
