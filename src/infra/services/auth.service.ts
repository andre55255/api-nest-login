import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { AuthDto, AuthResponseDto } from '../../dtos/auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { ThrowHttpException } from 'src/dtos/utils/http-exception.dto';
import { UserRepositoryInterface } from 'src/core/repositories/user-repo.service-interface';
import { TreatmentException } from 'src/helpers/static-methods';

@Injectable()
export class AuthService implements AuthServiceInterface {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepositoryInterface,
  ) {}

  public async signIn(dto: AuthDto): Promise<AuthResponseDto> {
    try {
      const { username, password } = dto;

      const userExist = await this.userRepo.findByUsername(username);
      if (!userExist) {
        this.logger.warn(
          `Não foi encontrado um usuário com o nome de usuário ${username}`,
        );
        ThrowHttpException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuário não encontrado',
        });
        return;
      }

      const validPasswords = await this.comparePasswords(
        password,
        userExist.password_hash,
      );
      if (!validPasswords) {
        ThrowHttpException({
          status: HttpStatus.UNAUTHORIZED,
          message: 'Senhas não conferem',
        });
        return;
      }

      const accessToken = await this.generateAccessToken(
        userExist.id,
        userExist.email,
        userExist.username,
      );

      const refreshToken = await this.generateRefreshToken(
        userExist.id,
        userExist.email,
        userExist.username,
      );
      await this.setRefreshToken(userExist.id, refreshToken);

      const roles = userExist.roles.map((role) => {
        return role.role.normalized_name;
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: userExist.id,
          username: userExist.username,
          email: userExist.email,
          roles: roles,
        },
      };
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Falha inesperada ao realizar login',
      );
    }
  }

  private async setRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const result = await this.userRepo.setRefreshToken(userId, refreshToken);
      if (!result.sucess) {
        ThrowHttpException({
          status: HttpStatus.BAD_REQUEST,
          message: result.message,
        });
      }
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao setar refresh token do usuário',
        `de id ${userId}, token ${refreshToken}`,
      );
    }
  }

  private async comparePasswords(
    bodyData: string,
    save: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(bodyData, save);
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao validar senhas',
      );
    }
  }

  private async generateAccessToken(
    id: string,
    email: string,
    username: string,
  ): Promise<string> {
    try {
      const payload = { id, username, email };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '0.5h',
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
      });

      if (!accessToken) {
        ThrowHttpException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Falha na geração de token de acesso',
        });
        return;
      }

      return accessToken;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada na geração de token de acesso',
        `, id ${id} email ${email} username ${username}`,
      );
    }
  }

  private async generateRefreshToken(
    id: string,
    email: string,
    username: string,
  ) {
    try {
      const saltOfRounds = 10;
      const value = `${id}@${email}@${username}@${new Date()}`;

      const token = await bcrypt.hash(value, saltOfRounds);
      return token;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada na geração de token de refresh',
        `, id ${id} email ${email} username ${username}`,
      );
    }
  }
}
