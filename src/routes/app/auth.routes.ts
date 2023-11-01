import { Express, Router } from "express";

import AuthController from "../../controller/auth/auth";


class AuthRouter {
    public router:Router = Router();
    private authController:AuthController = new AuthController();
    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post('/login',  this.authController.login)
        this.router.post('/register', this.authController.register)
    }

}

export default AuthRouter