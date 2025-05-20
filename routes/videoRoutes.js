const express = require('express')
const router = express.Router();

const upload = require('../middleware/upload')


const VideoController = require('../controllers/videoController')

module.exports = () => {

    router.get('/test', VideoController.testCallback)

    router.post('/tomp3', upload.single('file'), VideoController.videoToMp3)

    return router;
}