import { Module } from '@nestjs/common';
import { AuthModule } from './api/auth/auth.module';
import { PrismaModule } from 'src/database/prisma.module';
import { RootModule } from './api/_root/_root.module';

@Module({
  imports: [AuthModule, PrismaModule, RootModule],
})
export class AppModule {}
