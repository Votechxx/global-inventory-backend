import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import * as pug from 'pug';
import { Injectable } from '@nestjs/common';
import { Environment } from 'src/common/enums/environment.enum';
import { VIEW_PATH } from 'src/common/constants/path.constant';
import { ENV_VARIABLES } from 'src/common/config/env.config';

@Injectable()
export class EmailService {
    private from: string;

    constructor(private readonly configService: ConfigService) {
        this.from = `Al Montazah <${ENV_VARIABLES.email}>`;
    }

    newTransport() {
        if (this.configService.get('NODE_ENV') === Environment.PRODUCTION) {
            return nodemailer.createTransport({
                host: ENV_VARIABLES.emailHost,
                // secure: true,
                port: ENV_VARIABLES.emailPort,
                auth: {
                    user: ENV_VARIABLES.email,
                    pass: ENV_VARIABLES.emailPassword,
                },
            });
        }
        return null;
    }

    async send(template: string, subject: string, user: User, url?: string) {
        // 1) render html based on a pug template
        const fullPath = join(VIEW_PATH, 'email', `${template}.pug`);
        const html = pug.renderFile(fullPath, {
            name: user.firstName.split(' ')[0],
            url,
            subject: subject,
            email: user.email,
        });
        // 2) email options
        const mailOptions = {
            from: this.from,
            to: user.email,
            subject,
            html,
        };
        // 3) create a transporter and send email
        const transporter = this.newTransport();
        if (transporter) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Dev mode no email sent');
            console.log({ url, subject, email: user.email });
        }
    }

    async sendCustom(
        template: string,
        subject: string,
        to: string,
        name: string,
        object: object,
    ) {
        // 1) render html based on a pug template
        const fullPath = join(VIEW_PATH, 'email', `${template}.pug`);
        const html = pug.renderFile(fullPath, {
            name,
            object,
            subject: subject,
            email: to,
        });
        // 2) email options
        const mailOptions = {
            from: this.from,
            to,
            subject,
            html,
        };
        // 3) create a transporter and send email
        const transporter = this.newTransport();
        if (transporter) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log('Dev mode no email sent');
            console.log({ object, subject, email: to });
        }
    }

    async sendWelcome(user: User, url: string) {
        await this.send('welcome', 'Welcome To our website', user, url);
    }

    async verifyAccount(user: User, url: string) {
        await this.send(
            'verifyAccount',
            'Please Verify Your Account',
            user,
            url,
        );
    }

    async verifyAccountProvider(user: User, url: string) {
        await this.send(
            'verifyAccountProvider',
            'Your Application is under reviewd, Please Verify Your Account',
            user,
            url,
        );
    }

    async forgetPassword(user: User, url: string) {
        console.log('Forget Pass', user, url);

        await this.send('forgetPassword', 'Reset Your Password', user, url);
    }
}
