import { Logger, HttpStatus, Injectable } from '@nestjs/common';
import { role, user, user_roles } from '@prisma/client';
import { UserRepositoryInterface } from 'src/core/repositories/user-repo.service-interface';
import { PrismaService } from 'src/database/prisma.service';
import { ResultDto, ResultFail, ResultOk } from 'src/dtos/utils/result.dto';
import { TreatmentException } from 'src/helpers/static-methods';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  private readonly logger = new Logger('UserRepository');

  constructor(private readonly prisma: PrismaService) {}

  public async findById(userId: string): Promise<
    | (user & {
        roles: (user_roles & {
          role: role;
        })[];
      })
    | null
  > {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          roles: {
            include: {
              role: true
            }
          },
        },
      });

      return user;
    } catch (err) {
      this.logger.error(
        `Falha inesperada ao buscar usuário com o id ${userId}`,
        err,
      );
      return null;
    }
  }

  public async setNewPassword(userId: string, newPassword: string): Promise<void> {
    try {
      const result = await this.prisma.user.update({
        where: {
          id: userId
        },
        data: {
          password_hash: newPassword,
          updated_at: new Date()
        }
      });

      if (!result) {
        TreatmentException(
          null,
          HttpStatus.BAD_REQUEST,
          'Não foi possível editar usuário na base de dados',
          `usuário ${JSON.stringify(result)}`
        );
      } 
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao editar dados de usuário',
        `${userId}`
      );
    }
  }

  public async setRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<ResultDto> {
    try {
      const result = await this.prisma.user.update({
        data: {
          refresh_token: refreshToken,
          updated_at: new Date()
        },
        where: {
          id: userId,
        },
      });

      return ResultOk('OK', result);
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao setar refresh token',
        ` de usuário ${userId} ${refreshToken}`
      );
      return ResultFail('Falha inesperada ao setar refresh token');
    }
  }

  public async findByUsername(username: string): Promise<
    | (user & {
        roles: (user_roles & {
          role: role;
        })[];
      })
    | null
  > {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username,
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      return user;
    } catch (err) {
      this.logger.error(
        `Falha inesperada ao buscar usuário com o username ${username}`,
        err,
      );
      return null;
    }
  }
}
