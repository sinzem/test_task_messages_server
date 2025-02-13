import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { Roles } from './roles-auth.decorator';
// import { UsersService } from 'src/api/users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private jwtService: JwtService,
                // private usersService: UsersService,
                private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean>{
    const requiredRoles = this.reflector.get(Roles, context.getHandler());
    if (!requiredRoles) {
        return true;
    }
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if (!authHeader) { 
        throw new UnauthorizedException({message: "User is not authorized"}); 
    }
    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];
    if (bearer !== 'Bearer' || !token) { 
        throw new UnauthorizedException({message: "User is not authorized"}); 
    }
    
    let user;
    try {
        user = await this.jwtService.verifyAsync(token, {secret: process.env.ACC_TOKEN});
    } catch (e) {
        throw new UnauthorizedException({message: "Invalid token. Login to your account"});
    }

    // const checkUser = await this.usersService.getUserByEmail(user.email);
    // if (!checkUser) {
    //     throw new NotFoundException("User not found");
    // }
    // if (checkUser.activation !== "active") {
    //     throw new UnauthorizedException({message: "User's email address is not verified"});
    // }
    
    return requiredRoles.includes(user.role);
  }
}
