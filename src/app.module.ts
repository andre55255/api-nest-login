import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
})
export class AppModule {}
