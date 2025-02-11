import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ default: null, type: String })
  ownerPhoto: string;

  @Prop({ default: "message", type: String })
  role: "message" | "comment";

  @Prop({ default: null, type: String })
  text: string;

  @Prop({ default: null, type: String })
  image: string;

  @Prop({ default: null, type: String })
  textFile: string;

  @Prop({ default: null, type: Types.ObjectId })
  parentMessageId: Types.ObjectId;
  
  @Prop({ default: [], type: [String] })
  comments: string[];

  @Prop({ default: Date.now(), type: Date })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);