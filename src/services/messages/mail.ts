import {createTransport} from 'nodemailer'
import config from 'config'

export class SendNodeMail {
    private transporter;

    constructor() {
        this.transporter = createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'lucie.konopelski59@ethereal.email',
                pass: 'TumbxPG6vCtWgge26B'
            }
        })
    }


    public sendEmail = async(to:string) => {
        await this.transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>', // sender address
            to: to,
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
        })
        .then((response:any) => console.log("Node-mailer", response))
        .catch((error:any) => console.log("Node-mailer error", error))
    }


}
