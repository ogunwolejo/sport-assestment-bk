import {genSaltSync, hashSync, compareSync} from 'bcryptjs'

export class PasswordSecurity {
    private salt:string = genSaltSync(10)

    public hashingPassword = (userPassword:string):string => {
        const hashPassword = hashSync(userPassword, this.salt)
        return hashPassword
    }

    public comparePasswords = (hashedPassword:string, loginPassword:string):boolean => {
        const isPasswordCorrect:boolean = compareSync(loginPassword, hashedPassword)
        return isPasswordCorrect
    }
}