import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginUserDto, RegisterUserDto } from './dto/register-user.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'generated/prisma';
import { UtilsService } from 'src/common/utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
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

  async login(dto: LoginUserDto) {
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
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
      }),
    };
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

  update(id: number, updateAuthDto: UpdateRegisterDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
