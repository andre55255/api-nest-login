import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtSecretEnv } from 'src/helpers/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    const { email, password } = dto;
    const userExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (userExist) {
      throw new BadRequestException(
        `Já existe um usuário com o email ${email}`,
      );
    }
    const hashPassword = await this.hashPassword(password);
    const result = await this.prisma.user.create({
      data: {
        email,
        hashPassword,
      },
    });

    return {
      id: result.id,
      email,
      createdAt: result.createdAt,
    };
  }

  async signin(dto: AuthDto) {
    const { email, password } = dto;
    const userExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!userExist) {
      throw new BadRequestException('Usuário não encontrado');
    }
    const isMatch = await this.comparePasswords(
      password,
      userExist.hashPassword,
    );
    if (!isMatch) {
      throw new BadRequestException('Senhas não conferem');
    }
    const accessToken = await this.signToken(userExist.id, userExist.email);

    return {
      success: true,
      accessToken
    };
  }

  private async hashPassword(password: string) {
    const saltOfRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltOfRounds);
    return hashedPassword;
  }

  private async comparePasswords(bodyData: string, save: string) {
    return await bcrypt.compare(bodyData, save);
  }

  private async signToken(id: string, email: string) {
    const payload = { id, email };

    return await this.jwtService.signAsync(payload, {
      secret: jwtSecretEnv,
      expiresIn: '1h'
    });
  }
}
