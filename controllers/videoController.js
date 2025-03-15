const path = require('path');
const fs = require('fs');



const ffmpeg = require('fluent-ffmpeg');
// ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
ffmpeg.setFfmpegPath('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe');


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
            console.log('Request reached getInfo at:', new Date().toISOString());
            
            if (!req.files || !req.files.file) {
                return res.status(400).send('No file uploaded');
            }
            
            const file = req.files.file;
            console.log('File obtained:', file.name);
            
            // Return file info
            res.status(200).json({
                name: file.name,
                size: file.size,
                mimetype: file.mimetype
            });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    },



    async videoToMp3(req, res, next) {
        try {
            // Log when the request arrives at the controller
            console.log('Request reached videoToMp3 at:', new Date().toISOString());
            
            if (!req.files || !req.files.file) {
                return res.status(400).send('No file uploaded');
            }
            
            const file = req.files.file;
            console.log('File obtained:', file.name);
            
            const tempFilePath = file.tempFilePath;
            console.log('Temp file path:', tempFilePath);
            
            const outputPath = path.join(
                path.dirname(tempFilePath), 
                `${path.basename(tempFilePath)}.mp3`
            );
            
            ffmpeg(tempFilePath)
                .noVideo()
                .audioCodec('libmp3lame')
                .save(outputPath)
                .on('end', () => {
                    console.log('Audio Extracted for:', file.name);
                    
                    res.download(outputPath, `${file.name}.mp3`, (error) => {
                        if (error) {
                            console.log(error);
                            res.status(500).send('Error downloading file');
                        } else {
                            console.log('Audio sent back to user:', file.name);
                            
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
                    res.status(500).send('Error converting file');
                });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }
};
