import { IsString, Length } from 'class-validator';

import { CreateAddressDto } from '../addresses/dtos/create-address.dto';

export class CreateArenaDto extends CreateAddressDto {
  @IsString()
  @Length(3, 100)
  public name!: string;

  @IsString()
  public cnpj!: string;

  @IsString()
  public phone!: string;
}
