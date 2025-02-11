import { Body, Controller, Get, HttpCode, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { RegistrationAuthDto } from './dto/registration-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('api/auth')
export class AuthController {

    constructor(private authService: AuthService) {}

    @Post('registration')
    @HttpCode(200)
    registration(
        @Body() regDto: RegistrationAuthDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.registration(regDto, res);
    }

    @Post(`registration/:link`)
    @HttpCode(200)
    registrationManager(
        @Body() regDto: RegistrationAuthDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const query = req.params.link;
        return this.authService.registration(regDto, res, query);
    }

    @Post('login')
    @HttpCode(200)
    login(
        @Body() loginDto: LoginAuthDto,
        @Res({ passthrough: true }) res: Response
    ) {
        return this.authService.login(loginDto, res);
    }
 
    @Get("confirmation/:link")
    @HttpCode(200)
    async confirmation(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const link = req.params.link;
        return await this.authService.confirmation(link, res);;
    }

    @Get("refresh")
    @HttpCode(200)
    async refresh(@Req() req: Request) {
        const cookie = req.cookies;
        return await this.authService.refresh(cookie);;
    }

    @Get('logout')
    @HttpCode(200)
    logout(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const cookie = req.cookies;
        return this.authService.logout(cookie, res);
    }
}
