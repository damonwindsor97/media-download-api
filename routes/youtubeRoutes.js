const express = require('express');
const router = express.Router();

const YoutubeController = require('../controllers/youtubeController');
const youtubeController = require('../controllers/youtubeController');

module.exports = () => {

    router.post('/test', YoutubeController.testCallback);

    router.post('/getInfo', YoutubeController.getInfo)

    router.post('/getTitle', YoutubeController.getTitle);

    router.post('/downloadMp3', YoutubeController.downloadMp3)

    router.post('/downloadMp4', YoutubeController.downloadMp4)

    return router
}