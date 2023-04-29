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
import { ApiTags } from '@nestjs/swagger';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { APIResponseDto, APIResponseOk } from 'src/dtos/utils/api-response.dto';
import { TreatmentException } from 'src/helpers/static-methods';
import { AuthGuard } from './auth.guard';
import { JwtPayloadDto } from 'src/dtos/auth/jwt-payload.dto';

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

  @UseGuards(AuthGuard)
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
}
