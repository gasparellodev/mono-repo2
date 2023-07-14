import { readFileSync } from 'fs';
import { join } from 'path';

import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import Handlebars from 'handlebars';
import { Transporter, createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { ITemplatedData } from './interfaces/template-data.interface';
import { ITemplates } from './interfaces/templates.interface';
import { IEmailConfig } from '../config/interfaces/email-config.interface';

@Injectable()
export class MailerService {
  private readonly loggerService: LoggerService;
  private readonly transport: Transporter<SMTPTransport.SentMessageInfo>;
  private readonly email: string;
  private readonly domain: string;
  private readonly templates: ITemplates;

  constructor(private readonly configService: ConfigService) {
    const emailConfig = this.configService.get<IEmailConfig>('emailService');
    this.transport = createTransport(emailConfig);
    this.email = `Eu Jogo App <${emailConfig.auth.user}>`;
    this.domain = this.configService.get<string>('domain');
    this.loggerService = new Logger(MailerService.name);
    this.templates = {
      confirmation: MailerService.parseTemplate('confirmation.hbs'),
      resetPassword: MailerService.parseTemplate('password-reset.hbs'),
    };
  }

  /**
   * Compiles a Handlebars template from a file and returns a template delegate.
   * @param templateName The name of the Handlebars template file.
   * @returns The compiled Handlebars template delegate.
   */
  private static parseTemplate(
    templateName: string,
  ): Handlebars.TemplateDelegate<ITemplatedData> {
    const templateText = readFileSync(
      join(__dirname, 'templates', templateName),
      'utf-8',
    );
    return Handlebars.compile<ITemplatedData>(templateText, { strict: true });
  }

  /**
   * Sends an email using the configured transport and logs the result.
   *
   * @param {string} to - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} html - The HTML content of the email.
   * @param {string} [log] - An optional log message to include in the logging output.
   * @returns {void}
   */
  public sendEmail(
    to: string,
    subject: string,
    html: string,
    log?: string,
  ): void {
    this.transport
      .sendMail({
        from: this.email,
        to,
        subject,
        html,
      })
      .then(() => this.loggerService.log(log ?? 'A new email was sent.'))
      .catch((error) => this.loggerService.error(error));
  }

  public sendConfirmationEmail(user: User, token: string): void {
    const { email, name } = user;
    const subject = 'Confirme seu e-mail agora';
    const html = this.templates.confirmation({
      name,
      link: `https://${this.domain}/auth/confirm/${token}`,
    });
    this.sendEmail(email, subject, html, 'A new confirmation email was sent.');
  }

  public sendResetPasswordEmail(user: User, token: string): void {
    const { email, name } = user;
    const subject = 'Resetar sua senha';
    const html = this.templates.resetPassword({
      name,
      link: `https://${this.domain}/auth/reset-password/${token}`,
    });
    this.sendEmail(
      email,
      subject,
      html,
      'A new reset password email was sent.',
    );
  }
}
