import { Express, Request } from 'express';
import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Post, 
    Put, 
    Req, 
    UploadedFile, 
    UseGuards, 
    UseInterceptors, 
    UsePipes 
} from '@nestjs/common';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationPipe } from 'src/services/pipes/validation.pipe';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/api/auth/roles-auth.decorator';
import { RolesGuard } from 'src/api/auth/roles-guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/users')
export class UsersController {

    constructor(private usersService: UsersService) {}

    // @UsePipes(ValidationPipe)
    // @Post() 
    // createUser(@Body() dto: CreateUserDto) { 
    //     return this.usersService.createUser(dto);
    // }

    @Roles(["USER", "ADMIN"])
    @UseGuards(RolesGuard)
    @Put()
    @UsePipes(ValidationPipe)
    updateUser(
        @Body() dto: UpdateUserDto,
        @Req() req: Request
    ) {
        return this.usersService.updateUser(dto, req);
    }

    // @Roles(["USER", "ADMIN"])
    // @UseGuards(RolesGuard)
    // @Get()
    // getAll(@Req() request: Request) {
    //     return this.usersService.getAllUsers(request.query);
    // }

    @Roles(["USER", "ADMIN"])
    @UseGuards(RolesGuard)
    @Get("/:id")
    getUserById(@Param("id") id: string) {
        return this.usersService.getUserByIdToClient(id);
    }

    // @Roles(["USER", "ADMIN"])
    // @UseGuards(RolesGuard)
    // @Delete("/:id")
    // deleteUser(
    //     @Param("id") id: string,
    //     @Req() req: Request
    // ) {
    //     return this.usersService.deleteUser(id, req);
    // }

    @Roles(["USER", "ADMIN"])
    @UseGuards(RolesGuard)
    @Post("/photo")
    @UseInterceptors(FileInterceptor("file"))
    addPhoto(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request
    ) {
        return this.usersService.addPhoto(req, file);        
    }

    // @Roles(["USER", "ADMIN"])
    // @UseGuards(RolesGuard)
    // @Put("/photo")
    // deletePhoto(@Req() req: Request) {
    //     return this.usersService.deletePhoto(req);        
    // }
}
