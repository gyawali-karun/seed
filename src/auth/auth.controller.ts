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
    return this.authService.login(dto, res);
  }
  // @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refresh = req?.cookies['refreshToken'];
    if (!refresh) throw new UnauthorizedException('Missing refresh token');
    return this.authService.refreshToken(refresh, res);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: Request) {
    console.log(user);
    return this.authService.findAll();
  }
  @UseGuards(JwtAuthGuard)
  @Get(':email')
  findOne(@Param('email') email: string) {
    return this.authService.findOne(email);
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
