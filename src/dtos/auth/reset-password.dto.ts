import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export interface MailResetPasswordDto {
    name: string;
    email: string;
    username: string;
    newPassword: string;
}

export class RequestResetPasswordDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Nome de usuário não informado' })
    @IsString({ message: 'Nome de usuário inválido' })
    username: string;
}