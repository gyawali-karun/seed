import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { JwtAuthGuard } from 'src/common/guard/auth-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/common/decorator';
import { Request, Response } from 'express';
import { RequestWithCookies } from 'src/common/strategy/refresh.strategy';
import { User } from 'generated/prisma';
import { TokenPayload } from 'src/common/utils/utils.service';
import { JwtRefreshGuard } from 'src/common/guard/refresh-guard';

@ApiBearerAuth('jwt')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(dto);
    return this.authService.login(dto, res);
  }
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log('first');
    const refresh = req?.cookies['refreshToken'];
    if (!refresh) throw new UnauthorizedException('Missing refresh token');
    return this.authService.refreshToken(refresh, res);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: TokenPayload) {
    return this.authService.getProfile(user);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.authService.findOne(email);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: TokenPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    res.clearCookie('refreshToken', { path: '/' });
    return { success: true };
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateRegisterDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
