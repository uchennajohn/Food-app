import { StringSchema } from "joi";

export interface VendorPayload {
    id:string;
    email: string;
    serviceAvailable: boolean

}