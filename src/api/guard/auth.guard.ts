import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayloadDto } from 'src/dtos/auth/jwt-payload.dto';
import { ThrowHttpException } from 'src/dtos/utils/http-exception.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      ThrowHttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token de acesso não encontrado',
      });
    }
    await this.insertUserData(token, request);

    return true;
  }

  private async insertUserData(token: string, request: Request): Promise<void> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
      });
      request['user'] = payload as JwtPayloadDto;
    } catch {
      ThrowHttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido'
      })
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
