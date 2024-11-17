const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ffmpeg = require('ffmpeg-static');
const multer  = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = {
    async testCallback(req, res, next){
        try {
            res.send("video endpoint hit")
        } catch (error) {
            res.send(error)
        }
    },

    async videoToMp3(req, res, next) {

        try {
            const file = req.body.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            }

            
    
        } catch (error) {
            console.error('Unexpected error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
}