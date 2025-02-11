import { IsEmail, IsString, Length } from "class-validator";

export class LoginAuthDto {

    @IsString({message: "This should be a string"}) 
    @IsEmail({}, {message: "Incorrect email address"}) 
    readonly email: string;

    @IsString({message: "This should be a string"}) 
    // @Length(8, 30, {message: "The password length must be from 8 to 32 characters"}) 
    readonly password?: string;

    readonly forgottenPassword: boolean;

    readonly saveData: boolean;
}