import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Logger,
} from '@nestjs/common';
import { AuthDto } from '../../dtos/auth/auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { APIResponseDto, APIResponseOk } from 'src/dtos/utils/api-response.dto';
import { TreatmentException } from 'src/helpers/static-methods';
import { AuthGuard } from '../guard/auth.guard';
import { JwtPayloadDto } from 'src/dtos/auth/jwt-payload.dto';
import { RefreshDto } from 'src/dtos/auth/refresh.dto';
import { Roles } from '../guard/auth-roles.decorator';
import { Role } from '../guard/auth-roles.data';
import { RolesGuard } from '../guard/auth-roles.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthServiceInterface) {}

  @Post('signIn')
  @HttpCode(200)
  async signin(@Body() dto: AuthDto): Promise<APIResponseDto> {
    try {
      const result = await this.authService.signIn(dto);
      return APIResponseOk('Login efetuado com sucesso', result);
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Falha inesperada ao executar fluxo de login',
        JSON.stringify(dto),
      );
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.admin, Role.user)
  @Get('userInfo')
  @HttpCode(200)
  async userInfo(@Request() req): Promise<JwtPayloadDto> {
    try {
      const user = req.user as JwtPayloadDto;
      return user;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Falha inesperada ao informações de usuário logado'
      );
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() dto: RefreshDto): Promise<RefreshDto> {
    try {
      const tokens = await this.authService.refresh(dto);
      return tokens;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Falha inesperada ao pegar novos tokens'
      );
    }
  }
}
