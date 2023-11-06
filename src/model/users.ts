import { Schema, model, Model, Document } from 'mongoose';

interface IUser extends Document {
    firstName: string,
    lastName: string,
    email: string,
    emailVerified: boolean;
    phoneNumber: string,
    isPhoneNumberVerified: boolean,
    password: string,
    otp: string,
    isOtpVerified: boolean,
    interest:string;
}


const UserSchema = new Schema<IUser>({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, required:true, unique: true },
    emailVerified:{ type: Boolean, default: false },
    phoneNumber: { type: String, required:true, unique:true },
    isPhoneNumberVerified: { type: Boolean, default: false },
    interest:{type:String, default:''},
    password: { type: String, default: '' },
    otp: { type: String, default: '' },
    isOtpVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
})

export const User: Model<IUser> = model('user', UserSchema)
