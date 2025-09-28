import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private prisma: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const can = (await super.canActivate(context)) as boolean;
    if (!can) return false;
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user as { id: string };

    const refreshExists = await this.prisma.refreshToken.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
    if (!refreshExists) {
      throw new UnauthorizedException('Session expired, please login again');
    }
    return true;
  }
}
