import express, { Router } from 'express';
import AuthRouter from './app/auth.routes';
import authMiddleware from '../middleware/auth.middleware';

class AppRouter {
    public router: express.Router = Router();
    private authRouter:AuthRouter = new AuthRouter();
    
    constructor() {
        this.initializeRoutes()
    }

    initializeRoutes() {
        this.router.use('/auth', this.authRouter.router)
        //this.router.use('/profile', authMiddleware, ())
    }
}

export default AppRouter