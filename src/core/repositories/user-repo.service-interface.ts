import { role, user, user_roles } from '@prisma/client';
import { ResultDto } from 'src/dtos/utils/result.dto';

export abstract class UserRepositoryInterface {
  public abstract findByUsername(username: string): Promise<
    | (user & {
        roles: (user_roles & {
          role: role;
        })[];
      })
    | null
  >;

  public abstract findById(userId: string): Promise<
    | (user & {
        roles: (user_roles & {
          role: role;
        })[];
      })
    | null
  >;

  public abstract setRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<ResultDto>;
}
