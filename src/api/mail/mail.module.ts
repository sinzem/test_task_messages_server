import { Module } from '@nestjs/common';

import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  providers: [MailService],
  controllers: [MailController],
  exports: [MailService],
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        // ignoreTLS: true,
        secure: false,
        auth: {
          user: process.env.MAIL_SENDER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `${process.env.APP_NAME} <${process.env.MAIL_SENDER}>`,
      },
    }),
  ],
})
export class MailModule {}
