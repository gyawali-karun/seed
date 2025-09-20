import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

interface TokenPayload {
  sub: string;
  email: string;
  firstName: string | null | undefined;
  lastName: string | null | undefined;
}
@Injectable()
export class UtilsService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  private readonly saltRounds = 10;
  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async valdateUser(password: string, hashPassword: string) {
    const isValid = await bcrypt.compare(password, hashPassword);
    if (!isValid)
      throw new HttpException('Password not match', HttpStatus.NOT_FOUND);

    return;
  }

  // generateTokens(payload: TokenPayload) {
  //   return this.jwtService.signAsync(payload, {
  //     secret: this.configService.get<string>('JWT_SECRET'),
  //     expiresIn: '15m',
  //   });
  // }

  // async refreshToken(payload: TokenPayload) {
  //   return this.jwtService.signAsync(payload, {
  //     secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
  //     expiresIn: '7d',
  //   });
  // }

  async generateTokens(payload: TokenPayload) {
    const [access_token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return { access_token, refreshToken };
  }
  async verifyToken(token: string) {
    const k: TokenPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    console.log('s', k);
    return k;
  }
}
