import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, MinLength } from 'class-validator';

export abstract class SignInDto {
  @ApiProperty({
    description: 'O id ou username do usuário',
    type: String,
    example: "1 ou 'username'",
  })
  @IsString()
  @Length(3, 255)
  public emailOrUsername: string;

  @ApiProperty({
    description: 'A senha do usuário',
    type: String,
    example: 'yourpassword@STR1GHT',
  })
  @IsString()
  @MinLength(8)
  public password: string;
}
