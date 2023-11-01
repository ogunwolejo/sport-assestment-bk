import { NextFunction, Request, Response } from 'express';
import { IHttpException } from '../interface/httpException.interface';


const errorMiddleware = (error: IHttpException, req: Request, res: Response, next: NextFunction) => {
    try {
        const status: number = error.status || 500;
        const message: string = error.message || 'Something went wrong';
        res.status(status).json({ message });
    } catch (error) {
        next(error);
    }
};

export default errorMiddleware;
