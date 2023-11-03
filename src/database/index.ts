import mongoose from 'mongoose';
import config from 'config'


class Database{ 
    constructor() {
        const password = config.get('dbPassword')
        mongoose.connect(`mongodb+srv://ogunwole888:${password}@sluster.bvbz6dn.mongodb.net/`)
        .then(() => {
          console.log('Database connection successful')
        })
        .catch(err => {
          console.error('Database connection error')
          console.log('err', err)
        })
    }
}

export default Database;
