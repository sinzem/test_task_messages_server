import { IsEmail, IsString, Length } from "class-validator";

export class FeedbackDto {
 
    @IsString({message: "This should be a string"}) 
    @Length(2, 20, {message: "The name length must be from 2 to 20 characters"}) 
    readonly name: string;

    @IsString({message: "This should be a string"}) 
    @IsEmail({}, {message: "Incorrect email address"}) 
    readonly email: string

    @IsString({message: "This should be a string"}) 
    @Length(1, 5000, {message: "The message must not be empty"})
    readonly text: string;
    
}