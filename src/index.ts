process.env["NODE_CONFIG_DIR"] = __dirname + "/envconfig";

import express, { Express } from "express"
import Middleware from "./middleware/middleware";
import AppRouter from "./routes/appRoutes";
import http from 'http'
import config from "config"

class App {
    private AppRouter:AppRouter = new AppRouter();
    private middlewares:Middleware = new Middleware();
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
        this.server = http.createServer(this.app)
        this.initializeApp()
    }

    private initializeApp() {
        this.middlewares.initializeMiddleware()
        this.app.use("/api/v1", this.AppRouter.router)
        this.server.listen(config.get("port") || 9000, () => {
            console.log(`listening on ${config.get("port")}`)
        });
      
    }    
}

export function getAppInstance(): App {
    return App.getInstance();
}
 
export default new App();
  