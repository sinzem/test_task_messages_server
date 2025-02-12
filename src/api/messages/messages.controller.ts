import { Body, Controller, Delete, Param, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles-guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('api/messages')
export class MessagesController {

    constructor(private messagesService: MessagesService) {}

    @Roles(["USER", "ADMIN"])
    @UseGuards(RolesGuard)
    @UseInterceptors( FileFieldsInterceptor([
        { name: "imageFile", maxCount: 1 }, 
        { name: "textFile", maxCount: 1 }, 
    ]))
    @Post() 
    addMessage(
        @Req() req: Request,
        @Body() dto: CreateMessageDto,
        @UploadedFiles() files: { imageFile?: Express.Multer.File[]; textFile?: Express.Multer.File[] },        
    ) { 
        const imageFile = files.imageFile?.[0]; 
        const textFile = files.textFile?.[0]; 

        return this.messagesService.addMessage(req, dto, imageFile, textFile);
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
