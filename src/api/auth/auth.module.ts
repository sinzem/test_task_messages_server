import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailModule } from 'src/api/mail/mail.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/api/users/user.schema';
import { UsersModule } from 'src/api/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [AuthService],
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.PRIVATE_KEY,
      signOptions: {}
  }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
    MailModule,
    UsersModule,
  ],
  exports: [
    AuthService,
    JwtModule,
  ]
})
export class AuthModule {}
