import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto/register-user.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RefreshToken, User } from 'generated/prisma';
import { UtilsService } from 'src/common/utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly utils: UtilsService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  async register(dto: RegisterUserDto): Promise<User | null> {
    const { email, password, profile } = dto;
    const hashPassword = await this.utils.hashPassword(password);
    return this.prisma.user.create({
      data: {
        email,
        password: hashPassword,
        profile: {
          create: {
            firstName: profile?.firstName,
            lastName: profile?.lastName,
          },
        },
      },
    });
  }

  async login(dto: LoginUserDto, res: Response) {
    const { email, password } = dto;
    const getUser = await this.findOne(email as string);
    if (!getUser)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    await this.utils.valdateUser(password as string, getUser?.password);
    const payload = {
      sub: getUser.id,
      email: getUser.email,
      firstName: getUser.profile?.firstName,
      lastName: getUser.profile?.lastName,
    };

    const { access_token, refreshToken } =
      await this.utils.generateTokens(payload);
    const userId: string = getUser.id;
    await this.upsertRefreshToken(refreshToken, userId);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return { access_token };
  }

  async refreshToken(refresh: string, res: Response) {
    try {
      const dbToken = await this.findRefreshToken(refresh);

      if (!dbToken) {
        throw new UnauthorizedException('Refresh token not found or expired');
      }

      const isVal = await this.utils.verifyToken(refresh);
      if (!isVal) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const getUser = await this.findById(dbToken.userId);
      if (!getUser) throw new UnauthorizedException('User not found');

      const payload = {
        sub: getUser.id,
        email: getUser.email,
        firstName: getUser?.profile?.firstName,
        lastName: getUser?.profile?.lastName,
      };

      const { access_token, refreshToken } =
        await this.utils.generateTokens(payload);

      await this.upsertRefreshToken(refreshToken, dbToken.userId);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return { access_token };
    } catch (error) {
      console.log('Refresh token error:', error);
      throw new UnauthorizedException();
    }
  }

  findAll() {
    return this.prisma.user.findMany({});
  }

  async findOne(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        profile: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });
  }
  update(id: number, updateAuthDto: UpdateRegisterDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async upsertRefreshToken(refreshToken: string, userId: string) {
    const expiresAt: Date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const token: RefreshToken = await this.prisma.refreshToken.upsert({
      where: {
        userId,
      },
      create: {
        tokenHash: refreshToken,
        userId,
        expiresAt,
      },
      update: {
        tokenHash: refreshToken,
        userId,
        expiresAt,
      },
    });

    console.log(token);
    return token;
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
