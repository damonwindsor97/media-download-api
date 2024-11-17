const express = require('express')
const router = express.Router();

const youtubeController = require('../controllers/youtubeController')

module.exports =  () => {
    router.get('/test', youtubeController.testCallback)

    router.post('/toMp4', youtubeController.youtubeToMp4)

    router.post('/getTitle', youtubeController.getTitle)

    return router
}