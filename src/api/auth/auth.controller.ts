import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuthDto } from '../../dtos/auth/auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { APIResponseDto, APIResponseOk } from 'src/dtos/utils/api-response.dto';
import { TreatmentException } from 'src/helpers/static-methods';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger('AuthController');

  constructor(private readonly authService: AuthServiceInterface) {}

  @Post('signin')
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
}
