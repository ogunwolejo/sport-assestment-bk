export interface IAuthRegister {
    email: string;
    password: string;
    fullname: string;
    mobile:string
}

import { Request } from 'express';

export interface IToken {
    id: string
}


export const CONFIG_OTP_GENERATOR = {
    specialChars: false,
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false
}