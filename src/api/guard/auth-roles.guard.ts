import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './auth-roles.decorator';
import { JwtPayloadDto } from 'src/dtos/auth/jwt-payload.dto';
import { ThrowHttpException } from 'src/dtos/utils/http-exception.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length <= 0) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      ThrowHttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token de acesso não encontrado',
      });
      return;
    }
    const payload = await this.getPayloadTokenJwt(token);
    const isPermission = requiredRoles.some((role) =>
      payload.roles.includes(role),
    );
    if (!isPermission) {
      ThrowHttpException({
        status: HttpStatus.FORBIDDEN,
        message: 'Acesso negado, perfil não tem acesso',
      });
      return;
    }
    return true;
  }

  private async getPayloadTokenJwt(token: string): Promise<JwtPayloadDto> {
    let payload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
      });
      payload = payload as JwtPayloadDto;
    } catch {
      ThrowHttpException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Token inválido',
      });
      return;
    }
    return payload;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authorizationHeader =
      request.headers['authorization'] ?? request.headers['Authorization'];
    const [type, token] = authorizationHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
