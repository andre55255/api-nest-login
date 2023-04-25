import { Length, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail({}, { message: 'Email não informado' })
  public email: string;

  @IsNotEmpty({ message: 'Senha não informada' })
  @IsString({ message: 'Senha inválida' })
  @Length(3, 6, { message: 'Senha deve ter entre 3 e 6 caracteres' })
  public password: string;
}
