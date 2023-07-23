import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

import { PaymentGatewaysType } from '../enums/payment-gateways-type.enum';

export class AddPaymentGatewayDto {
  @ApiProperty({
    enum: PaymentGatewaysType,
    description: 'Tipo do gateway de pagamento',
    example: 'MERCADO_PAGO',
  })
  @IsEnum(PaymentGatewaysType)
  public type!: PaymentGatewaysType;

  @ApiProperty({
    description: 'Token de acesso do gateway de pagamento',
    type: String,
  })
  @IsString()
  public access_token!: string;

  @ApiProperty({
    description: 'Token de atualização do gateway de pagamento',
    type: String,
  })
  @IsString()
  public refresh_token!: string;

  @ApiProperty({
    description:
      'Tempo de expiração do token de acesso do gateway de pagamento',
    type: Number,
  })
  @IsNumber()
  public expires_in!: number;

  @ApiProperty({
    description: 'Data que o token do gateway de pagamento foi gerado',
    type: Date,
  })
  @IsDate()
  @IsOptional()
  public generated_at?: Date;
}
