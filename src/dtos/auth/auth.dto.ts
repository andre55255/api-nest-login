import { ApiProperty } from '@nestjs/swagger';
import { Length, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    minimum: 3,
    maximum: 20
  })
  @IsNotEmpty({ message: 'Nome de usuário não informado' })
  @IsString({ message: 'Nome de usuário não informado' })
  @Length(3, 20, { message: 'Nome de usuário deve ter entre 3 e 20 caracteres' })
  public username: string;

  @ApiProperty({
    minimum: 3,
    maximum: 6
  })
  @IsNotEmpty({ message: 'Senha não informada' })
  @IsString({ message: 'Senha inválida' })
  @Length(3, 6, { message: 'Senha deve ter entre 3 e 6 caracteres' })
  public password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

interface AuthUser {
  id: string;
  username: string;
  email: string;
  roles: string[];
}