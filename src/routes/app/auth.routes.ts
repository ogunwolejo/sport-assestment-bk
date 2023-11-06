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
        this.router.post('/', this.authController.authenticateUserByToken)
        this.router.post('/login',  this.authController.login)
        this.router.post('/login-mobile',  this.authController.loginByPhoneNumber)
        this.router.post('/register', this.authController.signup)
        this.router.post('/confirm-account', this.authController.confirmUserEmail)
        this.router.post('/changePassword', this.authController.changePassword)
        this.router.post('/verifyEmail', this.authController.verifyEmailForChangingPassword)
        this.router.post('/verifyOtp',  this.authController.verifyOtp);
        this.router.post('/update-email', this.authController.updateEmail)
        this.router.post('/update-password', this.authController.updatePassword)
    }

}

export default AuthRouter