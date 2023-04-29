import { HttpStatus } from '@nestjs/common';
import { SendMailServiceInterface } from 'src/core/services/send-mail.service-interface';
import nodemailer from 'nodemailer';
import { TreatmentException } from 'src/helpers/static-methods';
import SMTPTransport, { MailOptions } from 'nodemailer/lib/smtp-transport';
import { EmailOptionsDto } from 'src/dtos/email/email-options.dto';
import fs from 'fs';
import { MailResetPasswordDto } from 'src/dtos/auth/reset-password.dto';
import { CONSTANTS_TEMPLATE_EMAIL_NAME } from 'src/helpers/constants';

export class SendMailService implements SendMailServiceInterface {
  public async sendMailResetPassword(
    data: MailResetPasswordDto,
  ): Promise<void> {
    try {
      let html = this.getTemplateHtmlData(
        CONSTANTS_TEMPLATE_EMAIL_NAME.resetPassword,
      );
      html = html.replace('[[NAME_USER]]', data.name);
      html = html.replace('[[NEW_PASSWORD]]', data.newPassword);

      const mailOptions = this.buildMailOptions({
        destination: [data.email],
        subject: `Recuperação de senha - ${data.username}`,
        body: html
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
        from: process.env.EMAIL_HOST,
        to: options.destination,
        subject: options.subject,
        html: options.body
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
      const path = `${__dirname}/public/templates/${templateName}`;
      if (!fs.existsSync(path)) {
        TreatmentException(
          null,
          HttpStatus.BAD_REQUEST,
          'Template de email não encontrado',
          `Caminho: ${path}`,
        );
        return;
      }
      fs.readFile(path, (err, data) => {
        if (err) {
          TreatmentException(
            null,
            HttpStatus.BAD_REQUEST,
            'Falha na leitura de template de email',
            `Caminho: ${path}. Erro: ${err}`,
          );
          return;
        }
        return data.toString();
      });
    } catch (err) {
      TreatmentException(
        err,
        HttpStatus.BAD_REQUEST,
        'Falha inesperada ao pegar template de email',
        `Template: ${__dirname}/public/templates/${templateName}`,
      );
    }
  }

  private buildTransportMail(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
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
