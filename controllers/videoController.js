const fs = require('fs');
const path = require('path');

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
// ffmpeg.setFfmpegPath('C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe');


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
            console.log('Temp file path: ', tempFilePath);
    
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalname}.mp3"`);
    

            ffmpeg(tempFilePath)
                .noVideo() 
                .audioCodec('libmp3lame')
                .format('mp3')  
                .pipe(res, { end: true })  // Pipe the output directly to the response stream!!! IMPORTANT
                .on('end', () => {
                    console.log('Audio extracted and sent to user:', file.originalname);
                    try {
                        fs.unlinkSync(tempFilePath); 
                        console.log('Temporary file successfully deleted');
                    } catch (cleanupError) {
                        console.error('Error during cleanup:', cleanupError);
                    }
                })
                .on('error', (error) => {
                    console.error('Error during conversion:', error);
                    res.status(500).send('Error converting file: ', error);
                });

        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    }


    
}