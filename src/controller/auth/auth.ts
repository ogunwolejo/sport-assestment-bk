import { Request, Response, NextFunction } from "express"

class AuthController {
    public login = async(req:Request, res:Response, next: NextFunction) => {
        return res.status(200).json({
            msg:"sucess"
        })
    }
    public register = async(req:Request, res:Response, next: NextFunction) => {}
}

export default AuthController