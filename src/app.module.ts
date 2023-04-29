import { Module, Global } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { RepositoriesModule } from './infra/repositories.module';
import { ServiceModule } from './infra/services.module';
import { ApiModule } from './api/api.module';

@Global()
@Module({
  imports: [
    PrismaModule,
    RepositoriesModule,
    ServiceModule,
    ApiModule
  ],
})
export class AppModule {}
