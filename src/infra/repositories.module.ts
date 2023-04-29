import { Module, Global } from '@nestjs/common';
import { UserRepositoryInterface } from 'src/core/repositories/user-repo.service-interface';
import { UserRepository } from './repositories/user-repo.service';

@Global()
@Module({
  providers: [
    {
      provide: UserRepositoryInterface,
      useClass: UserRepository,
    },
  ],
  exports: [
    UserRepositoryInterface
  ]
})
export class RepositoriesModule {}
