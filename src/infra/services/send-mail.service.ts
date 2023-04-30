import { HttpStatus, Logger } from '@nestjs/common';
import { SendMailServiceInterface } from 'src/core/services/send-mail.service-interface';
import * as nodemailer from 'nodemailer';
import { TreatmentException, getBasePath } from 'src/helpers/static-methods';
import SMTPTransport, { MailOptions } from 'nodemailer/lib/smtp-transport';
import { EmailOptionsDto } from 'src/dtos/email/email-options.dto';
import * as fs from 'fs';
import * as path from 'path';
import { MailResetPasswordDto } from 'src/dtos/auth/reset-password.dto';
import { Constants } from 'src/helpers/constants';

export class SendMailService implements SendMailServiceInterface {
  private readonly logger = new Logger('SendMailService');

  public async sendMailResetPassword(
    data: MailResetPasswordDto,
  ): Promise<void> {
    try {
      let html = this.getTemplateHtmlData(Constants.templateEmailResetPassword);
      html = html.replace('[[NAME_USER]]', data.name);
      html = html.replace('[[NEW_PASSWORD]]', data.newPassword);

      const mailOptions = this.buildMailOptions({
        destination: [data.email],
        subject: `Recuperação de senha - ${data.username}`,
        body: html,
      });

      await this.sendMail(mailOptions);
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao disparar envio de email de recuperação de senha',
        JSON.stringify(data),
      );
    }
  }

  private async sendMail(options: MailOptions): Promise<void> {
    try {
      const transporter = this.buildTransportMail();
      const result = await transporter.sendMail(options);
      if (result && result.messageId) {
        this.logger.log(
          `Email enviado: ${JSON.stringify(options)} - ${JSON.stringify(
            result,
          )}`,
        );
        return;
      }
      TreatmentException(
        null,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao disparar email pelo transportador',
        `Opções: ${JSON.stringify(options)} - Resultado: ${JSON.stringify(
          result,
        )}`,
      );
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao disparar envio de email',
        JSON.stringify(options),
      );
    }
  }

  private buildMailOptions(options: EmailOptionsDto): MailOptions {
    try {
      const response: MailOptions = {
        from: process.env.EMAIL_USER,
        to: options.destination,
        subject: options.subject,
        html: options.body,
      };

      return response;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao enviar criar objeto para envio de email',
        JSON.stringify(options),
      );
    }
  }

  private getTemplateHtmlData(templateName: string): string {
    try {
      const pathName = `${getBasePath()}${path.sep}public${path.sep}templates${
        path.sep
      }${templateName}`;
      if (!fs.existsSync(pathName)) {
        TreatmentException(
          null,
          HttpStatus.BAD_REQUEST,
          'Template de email não encontrado',
          `Caminho: ${pathName}`,
        );
        return;
      }
      const result = fs.readFileSync(pathName);
      const response = Buffer.from(result).toString();
      return response;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao pegar template de email',
        `Template: ${__dirname}${path.sep}public${path.sep}templates${path.sep}${templateName}`,
      );
    }
  }

  private buildTransportMail(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    try {
      const data = {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        ssl: process.env.EMAIL_SSL === 'true' ? true : false,
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      };

      const transporter = nodemailer.createTransport({
        from: data.user,
        host: data.host,
        port: data.port,
        secure: data.ssl,
        auth: {
          user: data.user,
          pass: data.pass,
        },
      });

      return transporter;
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao enviar criar transportador de email',
      );
    }
  }
}
