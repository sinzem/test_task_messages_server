import { Controller, Get, NotFoundException, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';
import { Roles } from 'src/api/auth/roles-auth.decorator';
import { RolesGuard } from 'src/api/auth/roles-guard';

@Controller('files')
export class FilesController {

    // @Roles(["USER", "ADMIN"])
    // @UseGuards(RolesGuard)
    @Get('/photo/:filename')
    async getPhoto(
        @Param('filename') filename: string, 
        @Res() res: Response
    ) {
        const filePath = join(__dirname, "..", "..", "..", "static", "photo", filename);
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException({message: "File is not found"});
        }

        res.sendFile(filePath);
    }

    // @Roles(["USER", "ADMIN"])
    // @UseGuards(RolesGuard)
    @Get('/images/:filename')
    async getImage(
        @Param('filename') filename: string, 
        @Res() res: Response
    ) {
        const filePath = join(__dirname, "..", "..", "..", "static", "images", filename);
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException({message: "File is not found"});
        }

        res.sendFile(filePath);
    }

    // @Roles(["USER", "ADMIN"])
    // @UseGuards(RolesGuard)
    @Get('/txt/:filename')
    async getTxt(
        @Param('filename') filename: string, 
        @Res() res: Response
    ) {
        const filePath = join(__dirname, "..", "..", "..", "static", "text", filename);
        if (!fs.existsSync(filePath)) {
            throw new NotFoundException({message: "File is not found"});
        }
        res.sendFile(filePath, {
            headers: {
                "Content-Type": "text/plain; charset=Windows-1251"
            }
        });
    }

}