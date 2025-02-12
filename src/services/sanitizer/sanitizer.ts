import { BadRequestException } from "@nestjs/common";
import * as sanitizeHtml from 'sanitize-html';

export function sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
  
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
  
    return Object.keys(obj).reduce((acc, key) => {
        const sanitizedKey = key.startsWith('$') ? key.replace('$', '_') : key;
        acc[sanitizedKey] = sanitizeObject(obj[key]);
        return acc;
    }, {} as any);
}

export function sanitizeText(str: string): string {
    if (typeof str !== 'string' || str === null) {
        throw new BadRequestException({message: "This should be a string"});
    };

    const checkMessage = sanitizeHtml(str, {
        allowedTags: ["i", "strong", "code", "a"],
        allowedAttributes: {
            a: [ 'href', "title" ],
        },
    });

    return checkMessage;
}

export function sanitizeId(id: string): string {
    if (typeof id !== 'string' || id === null) {
        throw new BadRequestException({message: "ID should be a string"});
    };

    return id.replace(/[^a-z0-9\-]/ig, "").trim();
}

export function sanitizeEmail(email: string): boolean {
    if (typeof email !== 'string' || email === null) {
        throw new BadRequestException({message: "Email should be a string"});
    };

    const emailPrepared = email.trim();
    const reg = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/;
    return reg.test(emailPrepared);
}

