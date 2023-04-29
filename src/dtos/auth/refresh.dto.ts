import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'Token de acesso não informado' })
    @IsString({ message: 'Token de acesso inválido' })
    accessToken: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'Token de refresh não informado' })
    @IsString({ message: 'Token de refresh inválido' })
    refreshToken: string;
}