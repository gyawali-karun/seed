import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
export interface RequestWithCookies extends Request {
  cookies: {
    refreshToken?: string;
    [key: string]: string | undefined; // allow other cookies if needed
  };
}
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: RequestWithCookies) => {
          const refresh = req.cookies['refreshToken'];
          return typeof refresh === 'string' ? refresh : null;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    } as StrategyOptionsWithRequest);
  }

  validate(req: RequestWithCookies, payload: Record<string, string>) {
    const refreshTokenRaw = req?.cookies['refreshToken'];
    const refreshToken =
      typeof refreshTokenRaw === 'string' ? refreshTokenRaw : null;

    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    return {
      ...payload,
      refreshToken,
    };
  }
}
