const express = require('express')
const router = express.Router();

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure the upload directory exists
const uploadDir = path.join(__dirname, '../temp/videoUploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename that preserves the original extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Create multer instance with proper configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  }
});


const VideoController = require('../controllers/videoController')

module.exports = () => {

    router.get('/test', VideoController.testCallback)

    router.post('/getInfo', upload.single('file'), VideoController.getInfo)

    router.post('/tomp3', upload.single('file'), VideoController.videoToMp3)



    return router;
}