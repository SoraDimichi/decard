import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const whitelistedIps =
      this.configService.get<string[]>('WEBHOOK_IP_WHITELIST') || [];

    const clientIp = this.getClientIp(req);

    if (!whitelistedIps.includes(clientIp)) {
      throw new ForbiddenException('Access denied: IP not whitelisted');
    }

    next();
  }

  private getClientIp(req: Request): string {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0].trim();
      return ips;
    }

    return req.ip || req.connection.remoteAddress || '0.0.0.0';
  }
}
