import * as fs from "fs";
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FilesService {

    async createFile(file: Express.Multer.File, type: "photo" | "images" | "text"): Promise<string> {
        try {
            const resolution = file.originalname.split(".");
            const fileName = uuidv4() + `.${resolution.at(-1)}`; 
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
