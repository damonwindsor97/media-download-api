const express = require('express')
const router = express.Router();

const path = require('path');

const multer  = require('multer')
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../temp/videoUploads'),
    
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null,  uniqueSuffix + '-' + file.originalname)
    }
  })

const upload = multer({storage})


const VideoController = require('../controllers/videoController')

module.exports = () => {

    router.get('/test', VideoController.testCallback)

    router.post('/getInfo', upload.single('file'), VideoController.getInfo)

    router.post('/tomp3', upload.single('file'), VideoController.videoToMp3)



    return router;
}