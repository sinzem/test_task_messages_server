import 'dotenv/config';
import { BadRequestException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Request } from 'express';
import * as fs from "fs";
import * as path from 'path';

import { Message, MessageDocument } from './message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { FilesService } from 'src/api/files/files.service';
import { UsersService } from '../users/users.service';
import { sanitizeId, sanitizeText } from 'src/services/sanitizer/sanitizer';
import { MessagesGateway } from './messages.gateway';
// import { User } from '../users/user.schema';


@Injectable()
export class MessagesService {

    constructor(
        @InjectModel(Message.name) private messageModel: Model<Message>,
        // @InjectModel(User.name) private userModel: Model<User>,
        private filesService: FilesService,
        private usersService: UsersService,
        private messagesGateway: MessagesGateway
    ) {}

    async addMessage(
        req: Request, 
        dto: CreateMessageDto, 
        imageFile?: Express.Multer.File,
        textFile?: Express.Multer.File
    ): Promise<{createdMessage: MessageDocument}>  {
        const payload = await this.usersService.getPayload(req);
        const userById = await this.usersService.getUserById(payload.id);
        const text = sanitizeText(dto.text);
        let imagePath: string | null = null;
        if (imageFile && imageFile.size < 10000000) {
            imagePath = await this.filesService.createFile({file: imageFile, type: "images"});
        }
        let textFilePath: string | null = null; 
        if (textFile && textFile.size < 100000) {
            textFilePath = await this.filesService.createFile({file: textFile, type: "text"});
        }
        try {
            const createMessage =  await new this.messageModel({
                authId: String(userById._id),
                authPhoto: userById.photo,
                authName: userById.name,
                authEmail: userById.email,
                role: dto.role,
                text,
                image: imagePath,
                textFile: textFilePath,
                parentMessageId: dto.parentMessageId,
                createdAt: Date.now()
            }).save();
            if (dto.parentMessageId) {
                await this.messageModel.updateOne({_id: dto.parentMessageId}, { $push: { comments: String(createMessage._id )}});
            }
            // await this.userModel.updateOne({_id: userById._id}, {$push: { messages: createMessage._id }});
            this.messagesGateway.server.emit("message", createMessage);
            return {createdMessage: createMessage};
        } catch {
            throw new InternalServerErrorException({message: "Error creating message"});
        }
    }

    async deleteMessage(id: string, req: Request): Promise<{message: string}> {
        const checkedId = sanitizeId(id);
        const payload = await this.usersService.getPayload(req);
        const getMessageFromDb = await this.messageModel.findById(checkedId);
        if (!getMessageFromDb) {
            throw new BadRequestException({message: "Message not found"});
        }
        if (String(getMessageFromDb.authId) !== payload.id) {
            throw new NotAcceptableException("You cannot delete other people's messages");
        }
        let currentMessagesId = [getMessageFromDb.id];  
        let allMessageIds: string[] = [getMessageFromDb.id];
        let allImagePaths: string[] = [];
        let allTexstsPaths: string[] = [];
        while (currentMessagesId.length) {
            const currentMessage = currentMessagesId.pop();
            const message = await this.messageModel.findById(currentMessage);
            if (message && message.comments.length) {
                currentMessagesId = [...currentMessagesId, ...message.comments];
                allMessageIds = [...allMessageIds, ...message.comments];
            }
            if (message && message.image) {
                allImagePaths.push(message.image);
            }
            if (message && message.textFile) {
                allTexstsPaths.push(message.textFile);
            }
        } 
        while (allTexstsPaths.length) {
            const currentText = allTexstsPaths.pop();
            if (currentText) {
                const filePath = path.resolve(__dirname, "..", "..", "..", 'static', "text", currentText);
                if (fs.existsSync(filePath)) {
                    fs.rmSync(filePath);
                };
            }
        }
        while (allImagePaths.length) {
            const currentImage = allImagePaths.pop();
            if (currentImage) {
                const filePath = path.resolve(__dirname, "..", "..", "..", 'static', "images", currentImage);
                if (fs.existsSync(filePath)) {
                    fs.rmSync(filePath);
                };
            }
        }
        try {
            await this.messageModel.deleteMany({ _id: { $in: allMessageIds } });
        } catch {
            throw new InternalServerErrorException({message: "Error when deleting messages"});
        }
        this.messagesGateway.server.emit("delete", id);
        return {message: "Message successfully deleted"};
    }

    async getMessages(query: Record<string, any>): Promise<{messages: MessageDocument[]}> {
        const limit = query.lim ? +(query.lim) : 0;
        const offset = query.of ? +(query.of) : 0;
        // const total = await this.messageModel.countDocuments();
        const messages = await this.messageModel.find({role: "message"}).sort({createdAt: -1}).skip(offset).limit(limit);
        if (!messages || messages.length === 0) {
            throw new NotFoundException("Messages not found");
        }
        return {messages};
    }
}

