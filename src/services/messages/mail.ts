import Sib from 'sib-api-v3-sdk';
import config from 'config'

export class SendMail {
    public async sendMail(to:string, subject:string, body:string) {
        try {
            const client = Sib.ApiClient.instance
            const apiKey = client.authentications['api-key']
            apiKey.apiKey = config.get('sendInBlueApiKey')
            const tranEmailApi = new Sib.TransactionalEmailsApi()

            tranEmailApi.sendTransacEmail({
                sender: {
                    email: "jobahelpdesk@gmail.com",
                    name: 'Joshua ogunw',
                }
                ,
                to: [
                    {
                        email: to,
                    },
                ],
                subject,
                htmlContent: body,
            })
                .then(() => {})
                .catch(()=>{})
        } catch (error) {
            console.log('error', error)
        }

    }
}