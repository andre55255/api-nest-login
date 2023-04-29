import { MailResetPasswordDto } from "src/dtos/auth/reset-password.dto";

export abstract class SendMailServiceInterface {
  public abstract sendMailResetPassword(data: MailResetPasswordDto): Promise<void>;
}
