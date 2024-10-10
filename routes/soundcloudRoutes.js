const express = require('express');
const router = express.Router();

const SoundcloudController = require('../controllers/soundcloudController');


module.exports = () => {

    router.get('/test', SoundcloudController.testCallback);

    router.post('/getTitle', SoundcloudController.getTitle);

    router.post('/downloadMp3', SoundcloudController.downloadMp3);

    
    return router
}