import { Request, Response, NextFunction } from "express"
import { CONFIG_OTP_GENERATOR, IAuthRegister } from "../../interface/auth.interface";
import { User } from "../../model/users";
import config from "config";
import jwt from "jsonwebtoken"
import { SMS, USER_MESSAGES } from "../../util/messages";
import {Types} from "mongoose"
import OtpGenerator from 'otp-generator';
import { PasswordSecurity } from "../../util/bcrypt";
import { Sms } from "../../services/messages/sms";
import { SendNodeMail } from "../../services/messages/mail";

class AuthController {
    private bcrypt:PasswordSecurity = new PasswordSecurity()
    private sendNodemail:SendNodeMail = new SendNodeMail()


    public loginByPhoneNumber = async(req:Request, res:Response, next: NextFunction) => {
        try {
            const {data:{phoneNumber}} = req.body;
            // when the email and password is not defined; hence the user is login in through their phone number
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

        } catch (error) {
            next(error)
        }
    }
    
    public login = async(req:Request, res:Response, next: NextFunction) => {
        console.log(req)
        try {
            const {data:{email, password}} = req.body;
            //console.log(email, password)
            // when the email and password is not defined; hence the user is login in through their phone number
            const user = await User.findOne({email})
            .select('-otp -isOtpVerified').exec()
            //console.log(user)
            if(!user) {
                return res.status(400).json({
                    status:false,
                    error:USER_MESSAGES.INVALID_CREDENTIALS
                })
            }

            if(user) {
                //comparing hashpassword and user login in password
                const isPasswordCorrect:boolean = this.bcrypt.comparePasswords(user.password, password)
                if(!isPasswordCorrect) {
                    return res.status(400).json({
                        status:false,
                        error:USER_MESSAGES.INCORRECT_PASSWORD
                    })
                }
            }

            const token = jwt.sign({ id: user._id }, config.get('secretKey'));
            return res.status(200).json({ status: true, data: { token, user, }, message: USER_MESSAGES.USER_SIGNEDIN });    
        } catch (error) {
            next(error);
        }
    }

    public signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { data: { email, firstName, lastName, password, phoneNumber } } = req.body;
          console.log(req.body)
          let appUser = await User.findOne({ email: email })
          if (!appUser) {
            // hash the password
            const hashPassword:string = this.bcrypt.hashingPassword(password) 
            const payload = { email, firstName, lastName, password:hashPassword, phoneNumber }
            const result = await new User(payload).save();
            // send mail
            return res.status(201).json({ status: true, data: { user: result }, message: USER_MESSAGES.USER_CREATED });
        } else {
            this.sendNodemail.sendEmail('ogunwole888@gmail.com')
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
            const {data:{email}} = req.body;
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

    public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { body: { phoneNumber, otp, id } } = req;
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
    
    public changePassword = async(req:Request, res:Response, next:NextFunction) => {
        try {
            const {id, password} = req.body;
            const hashPassword:string = this.bcrypt.hashingPassword(password) 
            const changePassword = await User.findByIdAndUpdate(id, {
                passowrd:hashPassword
            })
            return res.status(200).json({
                status:true,
                data:{
                    changePassword
                },
                message:USER_MESSAGES.PASSWORD_CREATED
            })
        } catch (error) {
            next(error)
        }
    }
    
}

export default AuthController