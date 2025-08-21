import { IsInt, IsString, Min } from 'class-validator';

export class CreatePayoutDto {
  @IsString()
  number: string;

  @IsInt()
  @Min(1)
  amount: number;
}

export class CreatePayoutResponseDto {
  @IsString()
  order_token: string;
}
