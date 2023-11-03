import express, { Router } from 'express';
import AuthRouter from './app/auth.routes';

class AppRouter {
    public router: express.Router = Router();
    private authRouter:AuthRouter = new AuthRouter();
    
    constructor() {
        this.initializeRoutes()
    }

    initializeRoutes() {
        this.router.use('/auth', this.authRouter.router)
    }
}

export default AppRouter