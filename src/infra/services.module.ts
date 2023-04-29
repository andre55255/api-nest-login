import { Module, Global } from '@nestjs/common';
import { AuthServiceInterface } from 'src/core/services/auth.service-interface';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
    providers: [
        {
            provide: AuthServiceInterface,
            useClass: AuthService
        },
    ],
    imports: [JwtModule],
    exports: [
        AuthServiceInterface
    ]
})
export class ServiceModule {}