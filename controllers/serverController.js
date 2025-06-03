require('dotenv').config()

const Updates = require('../server/models/Updates')

module.exports = {
    async getDiscordUpdates(req, res, next){
        try {
            const data = await Updates.find();
            res.status(200).send(data)
            console.log('Updates sent')
        } catch (error) {
            console.log(error)
            res.send(400).send(error)
        }
    },

}