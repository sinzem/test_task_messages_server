import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop({ required: true, type: String })
  authId: string;

  @Prop({ default: null, type: String })
  authPhoto: string;

  @Prop({ default: null, type: String })
  authName: string;

  @Prop({ default: null, type: String })
  authEmail: string;

  @Prop({ default: "message", type: String })
  role: "message" | "comment";

  @Prop({ default: null, type: String })
  text: string;

  @Prop({ default: null, type: String })
  image: string;

  @Prop({ default: null, type: String })
  textFile: string;

  @Prop({ default: null, type: String })
  parentMessageId: string;
  
  @Prop({ default: [], type: [String] })
  comments: string[];

  @Prop({ type: Date })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);