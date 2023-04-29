import { Module, Global } from '@nestjs/common';
import { RootController } from './controllers/_root.controller';
import { AuthController } from './controllers/auth.controller';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guard/auth-roles.guard';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  controllers: [RootController, AuthController],
  imports: [JwtModule],
})
export class ApiModule {}
