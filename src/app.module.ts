import 'dotenv/config';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

import { UsersModule } from './api/users/users.module';
import { MessagesModule } from './api/messages/messages.module';
import { AuthModule } from './api/auth/auth.module';
import { MailModule } from './api/mail/mail.module';
import { FilesModule } from './api/files/files.module';

const DB = process.env.MONGO_DB;

@Module({
    imports: [
        // ServeStaticModule.forRoot({
        //     rootPath: join(__dirname, "..", 'static'), 
        // }),
        MongooseModule.forRoot(`${DB}`), 
        UsersModule, 
        MessagesModule, 
        AuthModule, 
        MailModule, 
        FilesModule
    ],
})
export class AppModule {}
