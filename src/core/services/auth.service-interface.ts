import { AuthDto, AuthResponseDto } from "src/dtos/auth/auth.dto";

export abstract class AuthServiceInterface {
    public abstract signIn(dto: AuthDto): Promise<AuthResponseDto>; 
}