const express = require('express');
const router = express.Router();

const YoutubeController = require('../controllers/youtubeController')

module.exports = () => {

    router.get('/test', YoutubeController.testCallback);

    router.post('/getTitle', YoutubeController.getTitle);

    router.post('/downloadMp4', YoutubeController.downloadMp4)

    return router
}