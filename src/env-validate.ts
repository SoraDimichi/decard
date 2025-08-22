import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min,
  validateSync,
  IsArray,
  ArrayNotEmpty,
  IsIP,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT: number;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  SECRET_KEY: string;

  @IsUUID()
  SHOP_KEY: string;

  @Transform(({ value }: { value: string }) =>
    value ? value.split(',').map((ip: string) => ip.trim()) : [],
  )
  @IsArray()
  @ArrayNotEmpty()
  @IsIP(undefined, { each: true })
  WEBHOOK_IP_WHITELIST: string[];

  @IsString()
  WEBHOOK_ROUTE: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
