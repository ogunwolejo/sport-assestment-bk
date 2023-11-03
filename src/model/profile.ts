import { Schema, model, Model, Document } from 'mongoose';

interface IProfile extends Document {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string,
    isPhoneNumberVerified: boolean,
    password: string,
    otp: string,
    isOtpVerified: boolean,
}


const UserSchema = new Schema<IProfile>({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    isPhoneNumberVerified: { type: Boolean, default: false },
    password: { type: String, default: '' },
    otp: { type: String, default: '' },
    isOtpVerified: { type: Boolean, default: false },
}, {
    timestamps: true,
})

export const User: Model<IUser> = model('user', UserSchema)
