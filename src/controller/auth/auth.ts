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
    private password:string =  config.get('secretKey')


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

            const token = jwt.sign({ id: user._id }, this.password);
            return res.status(200).json({ status: true, data: { token, user, }, message: USER_MESSAGES.USER_SIGNEDIN });

        } catch (error) {
            next(error)
        }
    }
    
    public login = async(req:Request, res:Response, next: NextFunction) => {
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

            const token = jwt.sign({ id: user._id }, this.password);
            return res.status(200).json({ status: true, data: { token, user, }, message: USER_MESSAGES.USER_SIGNEDIN });    
        } catch (error) {
            next(error);
        }
    }

    public signup = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { data: { email, firstName, lastName, password, phoneNumber, interest } } = req.body;
            console.log(req.body)
            let appUser = await User.findOne({ email: email })
            if (!appUser) {
                // hash the password
                const hashPassword:string = this.bcrypt.hashingPassword(password) 
                const payload = { email, firstName, lastName, password:hashPassword, phoneNumber, interest }
                const result = await new User(payload).save();
                // send mail
                const token = jwt.sign({ id: result._id }, this.password, {
                    expiresIn:'10m'
                });
                const host:string = `${config.get('frontedUrl')}/auth/email-verification?id=${token}`
                const emailBody:string = `              
                    <h1>Email Verification</h1>
                    <p>Click the button below to verify your email:</p>
                    <a href="${host}" target="_blank"><button>Verify Email</button></a>
                    <p> this link will expire in the next 10min </p>
                `
                this.sendNodemail.sendEmail(result.email, emailBody, 'Account Verification')  
                return res.status(201).json({ status: true, data: { user: result }, message: USER_MESSAGES.USER_CREATED });
        
            } 
            else {
                return res.status(200).json({
                    status:false,
                    error:USER_MESSAGES.USER_ALREADY_REGISTERED
                })
          }
        } catch (err) {
          next(err)
        }
    }

    public verifyEmailForChangingPassword = async(req: Request, res:Response, next:NextFunction) => {
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
            const token = jwt.sign({ id: user._id }, this.password, {
                expiresIn:'10m'
            });

            // reset password
            const host:string = `${config.get('frontedUrl')}/auth/change-password?id=${token}`
            const emailBody:string = `              
                <h1>Password Reset</h1>
                <p>click the button to change or rset password</p>
                <a href="${host}" target="_blank"><button>Reset Password</button></a>
                <p> this link will expire in the next 10min </p>
            `
            this.sendNodemail.sendEmail(user.email, emailBody, 'Password reset')  
            
            return res.status(200).json({
                status:true,
                message:USER_MESSAGES.PASSWORD_RECOVERY
            })
        } catch (error) {
            next(error)
        }
    }

    public confirmUserEmail = async(req:Request, res:Response, next:NextFunction) => {
        try {
            const {data:{token}} = req.body

            // verify that the token
            let t:any = this.verifyToken(token)
            if(!t.id) {
                return res.status(400).json({
                    status:false,
                    message:USER_MESSAGES.EXPIRED_TOKEN
                })
            }

            const updateUserEmail = await User.findByIdAndUpdate(t.id, {
                emailVerified:true
            })

            console.log(updateUserEmail)

            return res.status(200).json({
                status:true,
                message:'User account has been verified'
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
            const {token, password} = req.body.data;
            console.log(token, password)
            
            // verify token 
            let t:any = this.verifyToken(token)
            if(!t.id) {
                return res.status(400).json({
                    status:false,
                    message:USER_MESSAGES.EXPIRED_TOKEN
                })
            }
            
            const hashPassword:string = this.bcrypt.hashingPassword(password) 
            const changePassword = await User.findById(t.id)

            if(!changePassword) {
                return res.status(500).json({
                    status:false,
                    message:'Internal Error'
                })    
            }


            changePassword.password = hashPassword;
            await changePassword.save()
            console.log("changePassword", changePassword)



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

    private verifyToken = (token:string):string|jwt.JwtPayload => {
        const vT:string|jwt.JwtPayload =  jwt.verify(token, this.password)
        console.log("Error", vT)
        return vT
    }


    public updateEmail = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const authorization = req.body.Headers;
            const {password, newEmail} = req.body.data
            // console.log("authorization", authorization.Authorization, password, newEmail)
            const token:string = authorization.Authorization.split(" ")[1]
            console.log(token)

            // verify token
            const verifyToken:any = this.verifyToken(token)
            if(!verifyToken.id) {
                return res.status(400).json({
                    status:false,
                    error:"User is not authorized to make this change"
                })
            }
            
            // get the user by id
            const user = await User.findById(verifyToken.id)
            if(!user) {
                return res.status(401).json({
                    status:false,
                    error:USER_MESSAGES.USER_NOT_EXISTS
                })
            }

            // we verify the password
            const isPassword:boolean = this.bcrypt.comparePasswords(user.password, password)
            if(!isPassword) {
                return res.status(401).json({
                    status:false,
                    error:USER_MESSAGES.INCORRECT_PASSWORD
                })
            }

            user.email = newEmail
            await user.save()

            console.log(user)

            return res.status(200).json({
                status:true,
                message:'Email updated successfully'
            })


        } catch (error) {
            
        }
    }





    public updatePassword = async(req: Request, res: Response, next: NextFunction) => {
        try {
            const authorization = req.body.Headers;
            const {password, oldPassword} = req.body.data
            const token:string = authorization.Authorization.split(" ")[1]
            
            // verify token
            const verifyToken:any = this.verifyToken(token)
            if(!verifyToken.id) {
                return res.status(400).json({
                    status:false,
                    error:"User is not authorized to make this change"
                })
            }
            
            // get the user by id
            const user = await User.findById(verifyToken.id)
            if(!user) {
                return res.status(401).json({
                    status:false,
                    error:USER_MESSAGES.USER_NOT_EXISTS
                })
            }

            // we verify the password
            const isPassword:boolean = this.bcrypt.comparePasswords(user.password, oldPassword)
            if(!isPassword) {
                return res.status(401).json({
                    status:false,
                    error:USER_MESSAGES.INCORRECT_PASSWORD
                })
            }

            user.password = this.bcrypt.hashingPassword(password)
            await user.save()

            console.log(user)

            return res.status(200).json({
                status:true,
                message:'Password updated successfully'
            })


        } catch (error) {
            
        }
    }
    
}

export default AuthController