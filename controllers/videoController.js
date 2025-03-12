const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
// ffmpeg.setFfmpegPath('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe');

const multer  = require('multer')

module.exports = {
    async testCallback(req, res, next){
        try {
            res.send("video endpoint hit")
        } catch (error) {
            res.send(error)
        }
    },


    
    async getInfo(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            } else {
                console.log('File obtained:');
            }
            
            res.status(200).send(file)
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    },



    async videoToMp3(req, res, next) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            } else {
                console.log('File obtained');
            }
            
            const tempFilePath = file.path;
            console.log('Temp file path: ', tempFilePath)


            const outputPath = path.join(path.dirname(tempFilePath), file.filename + '.mp3');

            ffmpeg(tempFilePath)
                .duration(250)
                .noVideo()
                .audioCodec('libmp3lame')
                .timeout(30000)
                .save(outputPath)
                .on('end', () => {
                    console.log('Audio Extracted for: ', file.originalname);
                    
                    res.download(outputPath, `${file.originalname}.mp3`, (error) => {
                        if(error){
                            console.log(error);
                            res.status(500).send('Error downloading file: ', error);
                        } else {
                            console.log('Audio sent back to user: ', file.originalname);
                            
                            try {
                                fs.unlinkSync(tempFilePath);
                                fs.unlinkSync(outputPath);
                                console.log('Files successfully deleted');
                            } catch (cleanupError) {
                                console.error('Error during cleanup:', cleanupError);
                            }
                        }
                    });
                })
                .on('error', (error) => {
                    console.error('Error during conversion:', error);
                    res.status(500).send('Error converting file: ', error);
                });

        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    },


    
}