import { IsInt, Min } from 'class-validator';
import { IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePayinSimpleDto {
  @IsInt()
  @Min(1)
  amount: number;
}

class BillingDetailsDto {
  @IsString()
  name: string;

  @IsString()
  account: string;

  @IsString()
  bank_name: string;
}

export class CreatePayinSimpleResponseDto {
  @IsUrl()
  redirect_url: string;

  @IsString()
  order_token: string;

  @ValidateNested()
  @Type(() => BillingDetailsDto)
  billing_details: BillingDetailsDto;
}
