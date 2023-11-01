import express, {Express} from 'express';
import helmet from 'helmet';
import cors from 'cors'


class Middleware {
    private app:Express = express();
    
    public initializeMiddleware() {
        this.app.use(helmet())
        this.app.use(cors({
            allowedHeaders:"*",
            methods:["GET", "HEAD", "OPTIONS", "POST", "DELETE"],
            origin:"*"
        }))
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended:true}))

    }
}

export default Middleware