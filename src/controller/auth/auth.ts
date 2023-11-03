import { Request, Response, NextFunction } from "express"
import { CONFIG_OTP_GENERATOR, IAuthRegister, RequestTokenHandler } from "../../interface/auth.interface";
import { User } from "../../model/users";
import config from "config";
import jwt from "jsonwebtoken"
import { SMS, USER_MESSAGES } from "../../util/messages";
import {Types} from "mongoose"
import OtpGenerator from 'otp-generator';
import { PasswordSecurity } from "../../util/bcrypt";

class AuthController {
    private bcrypt:PasswordSecurity = new PasswordSecurity()
    
    public login = async(req:Request, res:Response, next: NextFunction) => {
        try {
            const {body:{email, password, phoneNumber}} = req;
            // when the email and password is not defined; hence the user is login in through their phone number
            if (!email && !password) {
                const user = await User.findOne({phoneNumber})
                .select('-password -otp -isOtpVerified').exec()
                if(!user) {
                    return res.status(401).json({
                        status:false,
                        error:USER_MESSAGES.USER_NOT_EXISTS
                    })
                }

                const token = jwt.sign({ id: user._id }, config.get('secretKey'));
                return res.status(200).json({ status: true, data: { token, user, }, message: USER_MESSAGES.USER_SIGNEDIN });
            }

            // when the phoneNumber is not defined
            const user = await User.findOne({email})
            .select('-password -otp -isOtpVerified').exec()
            if(!user) {
                return res.status(400).json({
                    status:false,
                    error:USER_MESSAGES.INVALID_CREDENTIALS
                })
            }
            //comparing hashpassword and user login in password
            const isPasswordCorrect:boolean = this.bcrypt.comparePasswords(user?.password, password)
            if(!isPasswordCorrect) {
                return res.status(400).json({
                    status:false,
                    error:USER_MESSAGES.INCORRECT_PASSWORD
                })
            }

            const token = jwt.sign({ id: user._id }, config.get('secretKey'));
            return res.status(200).json({ status: true, data: { token, user, }, message: USER_MESSAGES.USER_SIGNEDIN });    
        } catch (error) {
            next(error);
        }
    }

    public signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { body: { email, firstName, lastName, password, phoneNumber } } = req;
          let appUser = await User.findOne({ email: email })
          if (!appUser) {
            // hash the password
            const hashPassword:string = this.bcrypt.hashingPassword(password) 
            const payload = { email, firstName, lastName, password:hashPassword, phoneNumber }
            const result = await new User(payload).save();
            return res.status(201).json({ status: true, data: { user: result }, message: USER_MESSAGES.USER_CREATED });
          } else {
            return res.status(200).json({
                status:false,
                error:USER_MESSAGES.USER_ALREADY_REGISTERED
            })
          }
        } catch (err) {
          next(err)
        }
    }

    public verifyEmail = async(req: Request, res:Response, next:NextFunction) => {
        try {
            const {body:{email}} = req;
            const user = await User.findOne({email})
            if(!user) {
                return res.status(200).json({
                    status:false,
                    error:USER_MESSAGES.USER_NOT_EXISTS
                })
            }
            // we send an email notification for the user to change their password passing the user _id 
            return res.status(200).json({
                status:true,
                message:USER_MESSAGES.PASSWORD_RECOVERY
            })
        } catch (error) {
            next(error)
        }
    }

    public verifyOtp = async (req: RequestTokenHandler, res: Response, next: NextFunction) => {
        try {
          const { body: { phoneNumber, otp }, id } = req;
          let appUser = await User.findOne({ _id: id, phoneNumber: phoneNumber, otp })
          if (appUser) {
            const result = await User.findByIdAndUpdate(appUser._id, { isPhoneNumberVerified: true }, {
              returnOriginal: false
            });
            return res.status(200).json({ status: true, data: result, message: SMS.VERIFIED_SUCCESSFULLY });
          } else {
            return res.status(500).json({ status: false, error: SMS.INVALID_OTP });
          }
        } catch (err) {
          next(err)
        }
    }
    
    // public sendOtp = async (req: RequestTokenHandler, res: Response, next: NextFunction) => {
    //     try {
    //         const { body: { phoneNumber }, id } = req;
    //         const checkNumber = await User.findOne({phoneNumber:phoneNumber,_id:{$ne: new Types.ObjectId(id) }});
    //         if(!checkNumber){
    //         const otp = OtpGenerator.generate(4, CONFIG_OTP_GENERATOR)
    //         await User.findByIdAndUpdate(id, { otp: otp,  phoneNumber: phoneNumber, isPhoneNumberVerified:true }, { returnOriginal: false })
    //         const result = await User.findById(id)
    //         // await this.utilService.sms(SMS_MESSAGE.SMS_FROM, `${phoneCallingCode}${phoneNumber}`, (SMS_MESSAGE.OTP_VERIFICATION).replace('{{OTP}}', otp))
    //         //const result = await AppUser.findByIdAndUpdate(id, { otp: otp, phoneNumber: phoneNumber, phoneCallingCode: phoneCallingCode, phoneCountryCode: phoneCountryCode }, { returnOriginal: false })
    //         return res.status(200).json({ status: true, data: result, message: SMS.OTP_SENT });
    //         } 
    //         else{
    //         return res.status(200).json({ status: false, error: 'Mobile number already registered' });
    //         }
    //     } catch (err) {
    //         next(err)
    //     }
    // }
    
    // public resendOtp = async (req: RequestTokenHandler, res: Response, next: NextFunction) => {
    //     try {
    //         const { id } = req;
    //         let appUser = await User.findById(id)
    //         if (appUser) {
    //         const otp = OtpGenerator.generate(4, CONFIG_OTP_GENERATOR)
    //         await User.findByIdAndUpdate(id, { otp: otp, isPhoneNumberVerified:true }, { returnOriginal: false })
    //         const result = await User.findById(id)
    //         // await this.utilService.sms(SMS_MESSAGE.SMS_FROM, `${appUser.phoneCallingCode}${appUser.phoneNumber}`, (SMS_MESSAGE.OTP_VERIFICATION).replace('{{OTP}}', otp))
    //         // const result = await AppUser.findByIdAndUpdate(id, { otp: otp }, { returnOriginal: false })
    //         return res.status(200).json({ status: true, data: result, message: SMS.VERIFIED_SUCCESSFULLY });
    //         } else {
    //         return res.status(500).json({ status: false, error: SMS.ERROR_SENDING_MESSAGE });
    //         }
    //     } catch (err) {
    //         next(err)
    //     }
    // }
    
}

export default AuthController