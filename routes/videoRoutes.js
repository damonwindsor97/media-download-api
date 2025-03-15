const express = require('express')
const router = express.Router();


const VideoController = require('../controllers/videoController')

module.exports = () => {

    router.get('/test', VideoController.testCallback)

    router.post('/getInfo',  VideoController.getInfo)

    router.post('/tomp3', VideoController.videoToMp3)



    return router;
}