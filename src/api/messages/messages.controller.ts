import { Body, Controller, Delete, Param, Post, Req, UploadedFile, UseGuards, UsePipes } from '@nestjs/common';
import { Request } from 'express';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles-guard';

@Controller('api/messages')
export class MessagesController {

    constructor(private messagesService: MessagesService) {}

    @Roles(["USER", "ADMIN"])
    @UseGuards(RolesGuard)
    @Post() 
    addMessage(
        @Req() req: Request,
        @Body() dto: CreateMessageDto,
        @UploadedFile() image?: Express.Multer.File, 
        @UploadedFile() textFile?: Express.Multer.File,        
    ) { 
        return this.messagesService.addMessage(req, dto, image, textFile);
    }

    @Roles(["USER", "ADMIN"])
    @UseGuards(RolesGuard)
    @Delete("/:id")
    deleteMessage(
        @Param("id") id: string,
        @Req() req: Request
    ) {
        return this.messagesService.deleteMessage(id, req);
    }
}
