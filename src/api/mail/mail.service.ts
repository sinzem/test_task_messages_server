import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {

    constructor(private readonly mailerService: MailerService) {}

    public sendMessage({
        to, 
        from, 
        subject,
        text, 
        html = ""
    }: {
        to: string, 
        from: string, 
        subject: string, 
        text: string, 
        html?: string
    }): void {
        this.mailerService.sendMail({to, from, subject, text, html})
            .then(() => {
                return ({message: "Message sent successfully"})
            })
            .catch((e) => {
                return ({message: `Sending error: ${e}`})  
            });
    }

    // async sendActivationMail(to, link) { 
    //     await this.transporter.sendMail({
    //         from: process.env.SMTP_USER, 
    //         to, /* (кому) */
    //         subject: 'Активация аккаунта на ' + process.env.API_URL, 
    //         text: '', 
    //         html: 
    //             `
    //             <div>
    //                 <h1>Для активации перейдите по ссылке</h1>
    //                 <a href="${link}">${link}</a>
    //             </div>
    //             `
    //     })
    // }
}
