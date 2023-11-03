import { Response, NextFunction } from 'express';
import { HttpException } from '../util/exception';
import config from 'config';
import jwt from 'jsonwebtoken';
import { IToken } from '../interface/auth.interface';


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authToken = req.headers.get('authorization')?.split('Bearer ')[1] || null
        if (authToken) {
            const secretKey:string = config.get('secretKey');
            const tokenResponse = jwt.verify(authToken, secretKey) as IToken
            const userId = tokenResponse.id
            //@ts-ignore
            req.user = userId;
            next();
        } else {
            next(new HttpException(404, 'Authentication token missing'))
        }
    } catch (error) {
        next(new HttpException(401, 'Unauthorized'))
    }
}
export default authMiddleware;