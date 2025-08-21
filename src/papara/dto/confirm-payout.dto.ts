import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ConfirmPayoutRequestDto {
  @IsUUID()
  @IsString()
  order_token: string;
}

export class ConfirmPayoutDto {
  @IsUUID()
  @IsString()
  shop_key: string;

  @IsUUID()
  @IsString()
  order_token: string;

  @IsUUID()
  @IsString()
  @IsOptional()
  card_token?: string;
}

export class ConfirmPayoutResponseDto {
  @IsUUID()
  @IsString()
  order_token: string;

  @IsString()
  status: string;
}
