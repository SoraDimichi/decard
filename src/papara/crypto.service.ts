import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly secret: string;

  constructor(private configService: ConfigService) {
    this.secret = this.configService.get<string>('SECRET_KEY') || '';
  }

  stringify<T extends Record<string, any>>(obj: T) {
    return `{${Object.entries(obj)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `'${k}': '${v}'`)
      .join(', ')}}`;
  }

  getApiSign<T extends Record<string, any>>(payload: T) {
    const sorted = Object.entries(payload).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const values = sorted.map(([, value]) =>
      value && typeof value === 'object' && !Array.isArray(value)
        ? this.stringify(value)
        : String(value),
    );

    const signStr = this.secret + values.join('');
    return crypto.createHash('sha256').update(signStr).digest('hex');
  }

  verifySign<T extends Record<string, any>>(payload: T) {
    const { sign, ...rest } = payload;
    const expected = this.getApiSign(rest);
    return expected === sign;
  }
}
