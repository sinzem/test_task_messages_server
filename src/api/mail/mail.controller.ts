import { Body, Controller, Post, UsePipes } from '@nestjs/common';

import { MailService } from './mail.service';
import { ValidationPipe } from 'src/services/pipes/validation.pipe';
import { FeedbackDto } from './dto/feedback-service.dto';

@Controller('mail')
export class MailController {

    constructor(private mailService: MailService) {}
 
    @Post("api/feedback") 
    @UsePipes(ValidationPipe)
    create(@Body() dto: FeedbackDto) { 
        const toAdmin = {
            to: `${process.env.MAIL_ADMIN}`,
            from: `${process.env.MAIL_SENDER}`,
            subject: `Letter to administrator from ${dto.name}, ${dto.email}`
        }
        return this.mailService.sendMessage({...dto, ...toAdmin});
    }

}
