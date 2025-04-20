const fs = require('fs');
const path = require('path');

const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
// ffmpeg.setFfmpegPath('C:/Program Files/ffmpeg/bin/ffmpeg.exe');


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
            console.log('Request received');
            
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            } else {
                console.log('File obtained');
            }
    
            const tempFilePath = file.path;
    
            console.log('Sending file info...');
            res.status(200).send(file);
    
            console.log('Info sent, deleting temporary file...');
            fs.unlink(tempFilePath, (err) => {
                if (err) {
                    console.error('Error deleting temp file:', err);
                } else {
                    console.log('Temporary file deleted');
                }
            });
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
                console.log(`File obtained: ${file.originalname}`);
            }

            const originalName = file.originalname;
            // REMEMBER!! parse within path will remove the extension name
            const baseName = path.parse(originalName).name;
            
            const tempFilePath = file.path;

            console.log('Temp file path: ', tempFilePath)


            const outputPath = path.join(path.dirname(tempFilePath), file.filename + '.mp3');

            ffmpeg(tempFilePath)
                .noVideo()
                .audioCodec('libmp3lame')
                .format('mp3')  
                .save(outputPath)
                .on('end', () => {
                    console.log('Audio Extracted for: ', file.originalname);
                    
                    res.download(outputPath, `${baseName}.mp3`, (error) => {
                        if (error) {
                          console.error('Download error:', error);
                          return res.status(500).send('Error downloading file');
                        }
                      });
                      
                      res.on('finish', () => {
                        try {
                          fs.unlinkSync(tempFilePath);
                          fs.unlinkSync(outputPath);
                          console.log('Files successfully deleted');
                        } catch (cleanupError) {
                          console.error('Error during cleanup:', cleanupError);
                        }
                      });
                })
                .on('error', (error) => {
                    console.error('Error during conversion:', error);
                    res.status(500).send(`Error download file: ${error.message}`);
                });

        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    },


    
}