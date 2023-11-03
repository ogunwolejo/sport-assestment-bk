process.env["NODE_CONFIG_DIR"] = __dirname + "/envconfig";

import express, { Express, Request, Response } from "express"
import AppRouter from "./routes/appRoutes";
import http from 'http'
import config from "config"
import Database from "./database";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";

class App {
    private AppRouter:AppRouter = new AppRouter();
    private app:express.Application;
    public server: http.Server; // Create an http server
    private static instance: App;

    public static getInstance(): App {
        if (!App.instance) {
        App.instance = new App();
        }
        return App.instance;
    }

    
    constructor() {
        this.app = express()
        this.app.use(bodyParser.json());
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended:true}))
        this.app.use(helmet())
        this.app.use(cors({
            //allowedHeaders:"*",
            methods:["GET", "HEAD", "OPTIONS", "POST", "DELETE"],
            origin:"*"
        }))
        this.server = http.createServer(this.app)
        this.initializeApp()
    }

    private initializeApp() {
        this.server.listen(9000, () => {
            console.log(`listening on 9000`)
            new Database()
        });
        this.app.use("/api/v1", this.AppRouter.router)
    }    
}

 
export default new App();
  