export type IPayloadFromToken = {
    id: string;
    mail: string;
    role: string;
    iat: Date;
    exp: Date;
}