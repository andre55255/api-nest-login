import { Module } from '@nestjs/common';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { AuthService } from '../../infra/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { UserRepositoryInterface } from 'src/core/repositories/user-repo.service-interface';
import { UserRepository } from 'src/infra/repositories/user-repo.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../guard/auth-roles.guard';

@Module({
  providers: [
    {
        provide: AuthServiceInterface,
        useClass: AuthService
    },
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ],
  controllers: [AuthController],
  imports: [JwtModule],
})
export class AuthModule {}
