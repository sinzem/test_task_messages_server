import * as fs from "fs";
import * as path from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Express, Request } from 'express';
import { 
    BadRequestException,
    ConflictException, 
    Injectable, 
    InternalServerErrorException,
    NotAcceptableException,
    NotFoundException, 
    UnauthorizedException
} from '@nestjs/common';

import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IGetUsers, IUserToClient } from 'src/types/types/usersTypes';
import { JwtService } from '@nestjs/jwt';
import { IPayloadFromToken } from 'src/types/types/authTypes';
import { FilesService } from 'src/api/files/files.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
        private fileService: FilesService,
    ) {}

    async createUser(dto: CreateUserDto, activation?: string, query?: string): Promise<UserDocument> {
        const user = await this.userModel.findOne({email: dto.email});
        if (user) {
            throw new ConflictException({message: 'The email is already taken'});
        }
        const activity = activation ? activation : "inactive";  
        const hashPassword = await bcrypt.hash(dto.password, 5);
        let role = "USER";
        if (query) {
            const checkQuery = query.replace(/[^a-z0-9\-]/ig, "").trim();
            if (query && query === process.env.ADMIN_LINK) {
                role = "ADMIN";
            } else if (query && query !== process.env.ADMIN_LINK) {
                throw new ConflictException({message: 'Link to create user-manager is invalid'})
            }
        }
        
        const name = dto.name.replace(/[^@()а-яёъa-z0-9_\'\:\;\- ]/ig, "").trim();
        const createdUser = new this.userModel({
            ...dto, 
            name,
            role,
            password: hashPassword,
            activation: activity
        });
        return createdUser.save();
    }

    async updateUser(dto: UpdateUserDto, req: Request): Promise<{user: IUserToClient}> {
        const payload = await this.getPayload(req);
        const checkUser = await this.userModel.findOne({email: dto.email});
        if (checkUser && String(checkUser._id) !== payload.id) {
            throw new ConflictException({message: 'The email is already taken'});
        }
        const userFromDb = await this.getUserById(payload.id);
        const hashPassword = await bcrypt.hash(dto.password, 5);
        const newDto = {...dto, password: hashPassword};
        try {
            await this.userModel.updateOne({_id: payload.id}, newDto);
            const user = this.userToClient(Object.assign(userFromDb, newDto))
            return {user};
        } catch (e) {
            throw new InternalServerErrorException({message: "Error updating user data"});
        }
    }

    async getUserByEmail(email: string): Promise<UserDocument> {
        let user;
        try {
            user = await this.userModel.findOne({email});
        } catch (e) {
            throw new NotFoundException({message: "User not found"});
        }
        return user;
    }

    async getUserById(id: string): Promise<UserDocument> {
        const verifiedId = this.verifiedId(id);
        let user;
        try {
            user = await this.userModel.findById(verifiedId);
        } catch (e) {
            throw new NotFoundException({message: "No user found for this ID"});
        }
        return user;
    }

    async getUserByIdToClient(id: string): Promise<{user: IUserToClient}> {
        const verifiedId = this.verifiedId(id);
        let userFromDb;
        try {
            userFromDb = await this.userModel.findById(verifiedId);
        } catch (e) {
            throw new NotFoundException({message: "User not found at this ID"});
        }
        const user = this.userToClient(userFromDb);
        return {user};
    }

    // async getAllUsers(params)/* : Promise<IGetUsers> */ {
    //     const limit = params.lim ? +(params.lim) : 0;
    //     const offset = params.of ? +(params.of) : 0;
    //     const total = await this.userModel.countDocuments();
    //     const users = await this.userModel.find().skip(offset).limit(limit);
    //     if (!users || users.length === 0) {
    //         throw new NotFoundException("User not found");
    //     }
    //     return {users, total};
    // }

    async deleteUser(id: string, req: Request): Promise<{message: string}> {
        const verifiedId = this.verifiedId(id);
        const payload = await this.getPayload(req);
        const userFromDb = await this.getUserById(verifiedId);
        if (userFromDb.photo) {
            const filePath = path.resolve(__dirname, "..", "..", 'static', userFromDb.photo);
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath);
            }
        }
        if (verifiedId === payload.id) {
            try {
                await this.userModel.deleteOne({_id: id});
                return {message: "User data successfully deleted"};
            } catch (e) {
                throw new InternalServerErrorException("Error deleting user data");
            }
        } else {
            throw new NotAcceptableException("You can't delete someone else's account");
        }
        
    } 

    async addPhoto (req: Request, file: Express.Multer.File): Promise<{user: IUserToClient}> {
        const payload = await this.getPayload(req);
        const fileName = await this.fileService.createFile(file, "photo");
        if (file && file.size > 10000000) {
            throw new ConflictException({message: "Image size is too large"})
        }
        try {
            const userFromDb = await this.getUserById(payload.id);
            if (userFromDb.photo) {
                const filePath = path.resolve(__dirname, "..", "..", "..", "static", "photo", userFromDb.photo);
                if (fs.existsSync(filePath)) {
                    fs.rmSync(filePath);
                }
            }
            await this.userModel.updateOne({_id: payload.id}, {photo: fileName});
            const user = this.userToClient(userFromDb);
            user.photo = fileName;
            return {user};
        } catch (e) {
            throw new InternalServerErrorException("Error updating user data");
        }
    }

    async deletePhoto (req: Request): Promise<{user: IUserToClient}> {
        const payload = await this.getPayload(req);
        const userFromDb = await this.getUserById(payload.id);
        if (userFromDb && userFromDb.photo) {
            const filePath = path.resolve(__dirname, "..", "..", "..", "static", "photo", userFromDb.photo);
            if (fs.existsSync(filePath)) {
                fs.rmSync(filePath);
            }
            await this.userModel.updateOne({_id: payload.id}, {photo: null});
        }
        let user = this.userToClient(userFromDb);
        user.photo = null;
        return {user}
    }

    async getPayload(req: Request): Promise<IPayloadFromToken> {
        let token;
        try {
            token = req.headers.authorization?.split(" ")[1];
        } catch (e) {
            throw new BadRequestException({message: "Access token not found"});
        }

        let payload; 
        try {
            payload = await this.jwtService.verifyAsync(token, {secret: process.env.ACC_TOKEN});
        } catch (e) {
            throw new UnauthorizedException("Invalid access token");
        }
        return payload;
    }

    userToClient({_id, name, email, activation, role, photo, createdAt}: UserDocument): IUserToClient {
        const userToClient = {id: _id, name, email, activation, role, photo, createdAt};
        return userToClient as IUserToClient;
    }

    verifiedId = (id: string): string => {
        const verifiedId = id.replace(/[^a-z0-9\-]/ig, "");
        return verifiedId;
    }
}




