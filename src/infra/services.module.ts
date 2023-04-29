import { Module, Global } from '@nestjs/common';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { SendMailServiceInterface } from 'src/core/services/send-mail.service-interface';
import { SendMailService } from './services/send-mail.service';

@Global()
@Module({
  providers: [
    {
      provide: AuthServiceInterface,
      useClass: AuthService,
    },
    {
      provide: SendMailServiceInterface,
      useClass: SendMailService,
    },
  ],
  imports: [JwtModule],
  exports: [AuthServiceInterface, SendMailServiceInterface],
})
export class ServiceModule {}
