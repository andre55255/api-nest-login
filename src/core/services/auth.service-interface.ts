import { AuthDto, AuthResponseDto } from "src/dtos/auth/auth.dto";
import { RefreshDto } from "src/dtos/auth/refresh.dto";
import { RequestResetPasswordDto } from "src/dtos/auth/reset-password.dto";

export abstract class AuthServiceInterface {
    public abstract signIn(dto: AuthDto): Promise<AuthResponseDto>; 

    public abstract refresh(dto: RefreshDto): Promise<RefreshDto>;

    public abstract resetPassword(dto: RequestResetPasswordDto): Promise<void>;
}