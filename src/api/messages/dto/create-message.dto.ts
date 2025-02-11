import { IsString } from "class-validator";
import { Types } from "mongoose";

export class CreateMessageDto {

    @IsString({message: "This should be a string"}) 
    readonly role: "message" | "comment";

    @IsString({message: "This should be a string"}) 
    readonly text: string;

    // @IsString({message: "This should be a string"}) 
    readonly parentMessageId?: string;

    // readonly image?: File;

    // readonly textFile?: File;
}