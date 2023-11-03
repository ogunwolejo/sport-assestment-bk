const { Vonage } = require('@vonage/server-sdk')
import config from 'config'

const key:string = config.get('vonageKey')
const secret:string = config.get('vonageSecret')
 
const vonage = new Vonage({
    apiKey: key,
    apiSecret: secret
})

export const Sms = async(to:string, msg:string) => {
    const from = "Vonage APIs"    
    await vonage.sms.send({to, from, msg})
        .then((response:any) => {
            console.log("mail sent", response)
        })
        .catch((error:any) => {
            console.log("mail not sent error", error)
        })
    
}