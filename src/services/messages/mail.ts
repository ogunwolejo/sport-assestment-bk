import {createTransport} from 'nodemailer'
import config from 'config'

export class SendNodeMail {
    private transporter;

    constructor() {
        this.transporter = createTransport({
            host: 'smtp.gmail.com',
            service:'gmail',
            port: 587,
            secure:false,
            auth: {
                user: config.get('user'),
                pass: config.get('password')
            }
        })
    }


    public sendEmail = async(to:string, body:string, subject:string) => {
        await this.transporter.sendMail({
            from: {
                address:config.get('user'),
                name:'Joshua Ogunwole'
            },
            to: to,
            subject: subject, // Subject line
            text: "Hello world?", // plain text body
            html: body, // html body
        })
        .then((response:any) => console.log("Node-mailer", response))
        .catch((error:any) => console.log("Node-mailer error", error))
    }


}
