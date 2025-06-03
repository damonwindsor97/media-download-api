const express = require('express');
const router = express.Router();

const ServerController = require('../controllers/serverController')

module.exports = () => {

    router.get('/updates', ServerController.getDiscordUpdates)



    return router
}