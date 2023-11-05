import { Express, Router } from "express";
import AuthController from "../../controller/auth/auth";
import authMiddleware from "../../middleware/auth.middleware";

class AuthRouter {
    public router:Router = Router();
    private authController:AuthController = new AuthController();

    constructor() {
        this.initializeRoutes()
    }

    private initializeRoutes() {
        this.router.post('/login',  this.authController.login)
        this.router.post('/login-mobile',  this.authController.loginByPhoneNumber)
        this.router.post('/register', this.authController.signup)
        this.router.post('/changePassword', this.authController.changePassword)
        this.router.post('/verifyEmail', this.authController.verifyEmail)
        this.router.post('/verifyOtp',  this.authController.verifyOtp);
    }

}

export default AuthRouter