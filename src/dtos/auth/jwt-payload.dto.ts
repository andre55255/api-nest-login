export interface JwtPayloadDto {
    id: string;
    username: string;
    email: string;
    roles: string[];
}