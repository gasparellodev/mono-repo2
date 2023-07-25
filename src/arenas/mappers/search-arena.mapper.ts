import { ApiProperty } from '@nestjs/swagger';

import { SearchArenaResponse } from '../interfaces/search-arena.response.interface';

export class SearchArenaMapper {
  @ApiProperty({
    description: 'Uuid da arena',
    example: 'e0b2e0e0-0e0e-0e0e-0e0e-0e0e0e0e0e0e',
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Nome da arena',
    example: 'Arena 1',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Imagem da arena',
    example: 'https://url-da-imagem.com',
    type: String,
  })
  public image: string;

  @ApiProperty({
    description: 'Distância da arena em metros',
    example: 50000,
    type: Number,
  })
  public distance: number;

  constructor(values: SearchArenaResponse) {
    Object.assign(this, values);
  }

  public static map(result: SearchArenaResponse): SearchArenaMapper {
    return new SearchArenaMapper({
      id: result.id,
      name: result.name,
      image: result.image,
      distance: result.distance,
    });
  }
}
