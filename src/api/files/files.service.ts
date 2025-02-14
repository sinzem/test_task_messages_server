import * as fs from "fs";
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FilesService {

    // async createFile(file: Express.Multer.File, type: "photo" | "images" | "text"): Promise<string> {
    //     try {
    //         const resolution = file.originalname.split(".");
    //         const fileName = uuidv4() + `.${resolution.at(-1)}`; 
    //         const filePath = path.resolve(__dirname, "..", "..", "..", "static", type); 
    //         if (!fs.existsSync(filePath)) {
    //             fs.mkdirSync(filePath, {recursive: true}); 
    //         }
    //         fs.writeFileSync(path.join(filePath, fileName), file.buffer);
    //         return fileName;
    //     } catch (e) {
    //         throw new InternalServerErrorException({message: "An error occurred while writing the file"});
    //     }
    // }
    async createFile({
        file,
        type,
        photo
    }: {
        file: Express.Multer.File, 
        type: "photo" | "images" | "text", 
        photo?: string | null 
    }): Promise<string> {
        try {
            const resolution = file.originalname.split(".");
            let fileName;
            if (photo && typeof photo === "string" && type === "photo") {
                const splitPhoto = photo.split(".");
                fileName = splitPhoto.slice(0, splitPhoto.length - 1) + `.${resolution.at(-1)}`;
                const filePath = path.resolve(__dirname, "..", "..", "..", "static", "photo", photo);
                if (fs.existsSync(filePath)) {
                    fs.rmSync(filePath);
                }
            } else {
                fileName = uuidv4() + `.${resolution.at(-1)}`; 
            }
            const filePath = path.resolve(__dirname, "..", "..", "..", "static", type); 
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {recursive: true}); 
            }
            fs.writeFileSync(path.join(filePath, fileName), file.buffer);
            return fileName;
        } catch (e) {
            throw new InternalServerErrorException({message: "An error occurred while writing the file"});
        }
    }
}
// if (userFromDb.photo) {
//     const filePath = path.resolve(__dirname, "..", "..", "..", "static", "photo", userFromDb.photo);
//     if (fs.existsSync(filePath)) {
//         fs.rmSync(filePath);
//     }
// }
// let a = [1, 2, 3, 4]
// let b = a.slice(0, a.length - 1)

// console.log(b);
