import { 
    BadRequestException,
    ForbiddenException, 
    Injectable, 
    InternalServerErrorException, 
    NotFoundException, 
    UnauthorizedException 
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

import { RegistrationAuthDto } from './dto/registration-auth.dto';
import { User, UserDocument } from 'src/api/users/user.schema';
import { MailService } from 'src/api/mail/mail.service';
import { UsersService } from 'src/api/users/users.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { IPayloadFromToken } from 'src/types/types/authTypes';
import { IUserToClient } from 'src/types/types/usersTypes';
import { sanitizeEmail } from 'src/services/sanitizer/sanitizer';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private mailService: MailService,
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async registration(dto: RegistrationAuthDto, res: Response, query?: string): Promise<{user: IUserToClient}> {
        let activationLink = uuidv4();
        const saveData = dto.saveData ? "1" : "0";
        activationLink = activationLink.replace(/./, saveData);
        let userFromDB = await this.usersService.createUser(dto, activationLink, query);
        const link = `${process.env.SERVER_URL}/api/auth/confirmation/${activationLink}`;
        this.mailService.sendMessage({
            to: userFromDB.email,
            from: String(process.env.MAIL_SENDER),
            subject: "Account activation on " + process.env.APP_NAME, 
            text: "",
            html:  `
            <div>
                <h1>Для активации аккаунта на сайте ${process.env.APP_NAME} перейдите по ссылке внизу</h1>
                <a href="${link}">${link}</a>
            </div>
            `
        })
        const user = this.usersService.userToClient(userFromDB);
        return {user};
    }

    async confirmation(link: string, res: Response): Promise<void> {
        const checkLink = link.replace(/[^a-z0-9\-]/ig, "").trim();
        const user = await this.userModel.findOne({activation: checkLink})
        if (user) {
            const payload = {id: user._id, email: user.email, role: user.role};
            const durability = user.activation === "1" ? `${process.env.REF_EXPIRE}` : `${process.env.ACC_EXPIRE}`;
            const refreshToken = this.generateRefreshToken(payload, durability);
            await this.userModel.updateOne({_id: user._id}, {refreshToken, activation: "active"});
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: Boolean(process.env.COOKIE_SECURE),
                sameSite: 'strict',
                maxAge: 15 * 24 * 60 * 60 * 1000,
            });
            return res.redirect(`${process.env.CLIENT_URL}/users/${user._id}`);
        } else {
            throw new BadRequestException({message: "Incorrect activation link"}); 
        }  
    }

    async login(dto: LoginAuthDto, res: Response): Promise<{message?: string, user?: IUserToClient}> {
        const checkedEmail = sanitizeEmail(dto.email);
        if (!checkedEmail) {
            throw new BadRequestException({message: "Email address is not valid"});
        }
        let userFromDB = await this.usersService.getUserByEmail(dto.email); 
        if (!userFromDB) {
            throw new NotFoundException({message: "User not found at this email address"});
        }
        if (userFromDB && userFromDB.activation.length > 10) {
            throw new ForbiddenException({message: "Email address not confirmed. Check your email and follow the link"}); 
        } 
        if (!dto.forgottenPassword) {
            const passwordEquals = await bcrypt.compare(dto.password, userFromDB.password); 
            if (!passwordEquals) {
                throw new ForbiddenException({message: "Incorrect password"}); 
            }
        }
        const payload = {id: userFromDB._id, email: userFromDB.email, role: userFromDB.role};
        const durability = dto.saveData ? `${process.env.REF_EXPIRE}` : `${process.env.ACC_EXPIRE}`;
        const refreshToken = this.generateRefreshToken(payload, durability);
        let activationLink;
        if (dto.forgottenPassword) {
            activationLink = uuidv4();
            await this.userModel.updateOne({_id: userFromDB._id}, {refreshToken, activation: activationLink});
        } else {
            await this.userModel.updateOne({_id: userFromDB._id}, {refreshToken});
        }
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: Boolean(process.env.COOKIE_SECURE),
            sameSite: 'strict',
            maxAge: 15 * 24 * 60 * 60 * 1000,
        });
        if (dto.forgottenPassword) {
            const link = `${process.env.SERVER_URL}/api/auth/confirmation/${activationLink}`;
            this.mailService.sendMessage({
                to: userFromDB.email,
                from: String(process.env.MAIL_SENDER),
                subject: "Login on " + process.env.APP_NAME, 
                text: "",
                html:  `
                <div>
                    <h1>Для активации аккаунта на сайте ${process.env.APP_NAME} перейдите по ссылке внизу</h1>
                    <a href="${link}">${link}</a>
                </div>
                `
            })
            return {message: "Activation link sent by email"}
        } else {
            const user = this.usersService.userToClient(userFromDB);
            return {user};
        }
    }

    async refresh(cookie: Record<string, string>): Promise<{accessToken: string}> { 
        const refreshToken = cookie.refreshToken;
        if (!refreshToken) { 
            throw new BadRequestException({message: "Authorization error. Register or log in to your account"}); 
        }
        let userData = await this.validateRefreshToken(refreshToken);
        let user = await this.usersService.getUserById(userData.id);
        if (!user || user.activation !== "active" || refreshToken !== user.refreshToken) { 
            throw new BadRequestException({message: "Authorization error. Register or log in to your account"});
        }
        const payload = {id: user._id, email: user.email, role: user.role};
        const accessToken = this.generateAccessToken(payload);
        return {accessToken};
    }

    async logout(cookie: Record<string, string>, res: Response): Promise<{message: string}> {
        const refreshToken = cookie.refreshToken;
        if (!refreshToken) { 
            throw new BadRequestException({message: "Authorization error. Register or log in to your account"}); 
        }
        const user = await this.removeToken(refreshToken);
        if (user) {
            res.cookie('refreshToken', null);
            return {message: "Successful logout"};
        } else {
            throw new InternalServerErrorException({message: "Error logout"});
        }
    }

    private generateAccessToken(payload: Record<string, any>): string {
        return this.jwtService.sign(payload, {
          secret: process.env.ACC_TOKEN,
          expiresIn: process.env.ACC_EXPIRE,
        });
    }
    
    private generateRefreshToken(payload: Record<string, any>, durability: string): string {
        return this.jwtService.sign(payload, {
            secret: process.env.REF_TOKEN,
            expiresIn: durability,
        });
    }

    async validateAccessToken(token: string): Promise<IPayloadFromToken> { 
        try {
            const userData = await this.jwtService.verifyAsync(token, {secret: process.env.ACC_TOKEN});
            return userData;
        } catch (e) {
            throw new UnauthorizedException({message: "Invalid accessToken"}); 
        }
    }

    async validateRefreshToken(token: string): Promise<IPayloadFromToken> {
        try {
            const userData = await this.jwtService.verifyAsync(token, {secret: process.env.REF_TOKEN});
            return userData;
        } catch (e) {
            throw new UnauthorizedException({message: "Invalid refreshToken"});
        }
    }

    async findUserByToken(refreshToken: string): Promise<UserDocument | null> {
        try {
            const user = await this.userModel.findOne({refreshToken});
            return user;
        } catch (e) {
            throw new NotFoundException({message: "User not found"});
        }
    }

    async removeToken(refreshToken: string) : Promise<UserDocument | null> {
        try {
            const payload = await this.validateRefreshToken(refreshToken);
            await this.userModel.updateOne({refreshToken}, {refreshToken: null});
            return await this.userModel.findById(payload.id);
        } catch (e) {
            throw new InternalServerErrorException({message: "Error deleting refreshToken"});
        }
    }

}
