import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { AuthDto, AuthResponseDto } from '../../dtos/auth/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { ThrowHttpException } from 'src/dtos/utils/http-exception.dto';
import { UserRepositoryInterface } from 'src/core/repositories/user-repo.service-interface';
import { TreatmentException, generateRandomValue } from 'src/helpers/static-methods';
import { JwtPayloadDto } from 'src/dtos/auth/jwt-payload.dto';
import { RefreshDto } from 'src/dtos/auth/refresh.dto';
import { role, user, user_roles } from '@prisma/client';
import { SendMailServiceInterface } from 'src/core/services/send-mail.service-interface';
import { RequestResetPasswordDto } from 'src/dtos/auth/reset-password.dto';

@Injectable()
export class AuthService implements AuthServiceInterface {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: UserRepositoryInterface,
    private readonly mailService: SendMailServiceInterface
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

      const roles = userExist.roles.map((role) => {
        return role.role.normalized_name;
      });
      const tokens = await this.getTokens(userExist);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
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
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao realizar login',
      );
    }
  }

  public async refresh(dto: RefreshDto): Promise<RefreshDto> {
    try {
      const data = this.jwtService.decode(dto.accessToken);

      const userData = data as JwtPayloadDto;
      if (!userData) {
        this.logger.warn(`Falha ao pegar dados de usuário do token`);
        ThrowHttpException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Falha ao pegar dados de token',
        });
        return;
      }

      const userSave = await this.userRepo.findById(userData.id);
      if (!userSave) {
        this.logger.warn(
          `Não foi encontrado um usuário com o id ${userData.id}`,
        );
        ThrowHttpException({
          status: HttpStatus.NOT_FOUND,
          message: 'Usuário não encontrado',
        });
        return;
      }

      if (userSave.refresh_token !== dto.refreshToken) {
        this.logger.warn(
          `Refresh token diferente do existente na base de dados. Informado: ${dto.refreshToken}. Banco: ${userSave.refresh_token}`,
        );
        ThrowHttpException({
          status: HttpStatus.NOT_FOUND,
          message: 'Refresh token diferente do existente na base de dados',
        });
        return;
      }

      const tokens = await this.getTokens(userSave);
      return tokens;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao realizar refresh token',
        `access ${dto.accessToken}, refresh ${dto.refreshToken}`,
      );
    }
  }

  public async resetPassword(dto: RequestResetPasswordDto): Promise<void> {
    try {
      const user = await this.userRepo.findByUsername(dto.username);
      if (!user) {
        TreatmentException(
          null,
          HttpStatus.NOT_FOUND,
          'Usuário não encontrado',
          `Com o nome de usuário: ${dto.username}`
        )
        return;
      }

      const newPass = generateRandomValue(6);
      await this.mailService.sendMailResetPassword({
        name: user.username,
        username: user.username,
        email: user.email,
        newPassword: newPass
      });
      
      const hashPass = await this.hashPassword(newPass);
      await this.userRepo.setNewPassword(user.id, hashPass);
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao realizar recuperação de senha',
        `data ${JSON.stringify(dto)}`,
      );
    }
  }

  private async hashPassword(pass: string): Promise<string> {
    try {
      const saltOfRounds = 10;

      const response = await bcrypt.hash(pass, saltOfRounds);
      return response;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao tratar senha',
      );
    }
  }

  private async getTokens(
    user:
      | (user & {
          roles: (user_roles & {
            role: role;
          })[];
        })
      | null,
  ): Promise<RefreshDto> {
    try {
      const roles = user.roles.map((role) => {
        return role.role.normalized_name;
      });

      const accessToken = await this.generateAccessToken(
        user.id,
        user.email,
        user.username,
        roles,
      );

      const refreshToken = await this.generateRefreshToken(
        user.id,
        user.email,
        user.username,
      );
      await this.setRefreshToken(user.id, refreshToken);

      return {
        accessToken,
        refreshToken
      };
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao gerar tokens',
        `de usuário ${JSON.stringify(user)}`,
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
    roles: string[],
  ): Promise<string> {
    try {
      const payload: JwtPayloadDto = { id, username, email, roles };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN_ACCESS_TOKEN,
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
