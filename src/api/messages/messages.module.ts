import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message, MessageSchema } from './message.schema';
import { UsersModule } from '../users/users.module';
import { FilesModule } from 'src/api/files/files.module';
import { MessagesGateway } from './messages.gateway';
// import { User, UserSchema } from '../users/user.schema';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema}]),
    // MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
    UsersModule,
    FilesModule
  ],
  exports: [MessagesService, MessagesGateway]
})
export class MessagesModule {}
