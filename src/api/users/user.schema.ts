import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

import { RolesEnum } from 'src/types/enums/roles.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, unique: true, type: String })
    email: string;

    @Prop({ required: true, type: String })
    password: string;
    
    @Prop({ default: "", type: String })
    activation: string;

    @Prop({default: null, type: String })
    refreshToken: string;

    @Prop({ required: true, type: String })
    role: RolesEnum;

    @Prop({ default: null, type: String })
    photo: string;

    @Prop({ default: Date.now(), type: Date })
    createdAt: Date;

    // @Prop({type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }]})
    // messages: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);