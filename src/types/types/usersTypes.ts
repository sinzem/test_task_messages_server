import { Types } from "mongoose";
import { RolesEnum } from "../enums/roles.enum";

export type IGetUsers = {
    users: IUserToClient[]; 
    total: number;
}


export type IUserToClient = {
    id: Types.ObjectId;
    name: string;
    email: string;
    activation: string;
    role: string;
    photo: string | null;
    createdAt: Date;
};










