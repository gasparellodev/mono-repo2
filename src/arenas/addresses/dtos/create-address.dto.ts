import { IsLatitude, IsLongitude, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  public description!: string;

  @IsLatitude()
  public lat: number;

  @IsLongitude()
  public lon: number;
}
