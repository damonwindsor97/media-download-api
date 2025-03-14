const fs = require('fs');
const path = require('path');

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
            console.time('total-request');
            console.time('ffmpeg-init');
            console.log('[MP4 > MP3] Initiated...', new Date().toISOString());
            const file = req.file;
            if (!file) {
                return res.status(400).send('No file uploaded');
            } else {
                console.log('File obtained...', new Date().toISOString());
            }
            
            const tempFilePath = file.path;
            console.log('[MP4 > MP3] Temp file path: ', tempFilePath);
    
            const outputPath = path.join(path.dirname(tempFilePath), file.filename + '.mp3');
    
            console.log('[MP4 > MP3] Starting FFMPEG processes...', new Date().toISOString());
            console.timeEnd('ffmpeg-init');
            console.time('ffmpeg-processing');
            
            // Add timestamps for ffmpeg events
            const ffmpegStartTime = Date.now();
            
            ffmpeg(tempFilePath)
                .noVideo()
                .outputOptions([
                    '-preset ultrafast',
                    '-ac 1',
                    '-ar 22050',
                    '-b:a 64k'
                ])
                .on('start', (commandLine) => {
                    const startDelay = Date.now() - ffmpegStartTime;
                    console.log(`[MP4 > MP3] FFmpeg command started after ${startDelay}ms delay`, new Date().toISOString());
                    console.log(`[MP4 > MP3] Command: ${commandLine}`);
                })
                .on('progress', (progress) => {
                    console.log(`[MP4 > MP3] Processing: ${progress.percent}% done`, new Date().toISOString());
                })
                .on('error', (err) => {
                    console.error(`[MP4 > MP3] FFmpeg error: ${err.message}`, new Date().toISOString());
                    res.status(500).send('Error processing video');
                })
                .save(outputPath)
                .on('end', () => {
                    console.timeEnd('ffmpeg-processing');
                    console.time('response-preparation');
                    console.log('[MP4 > MP3] Audio Extracted for: ', file.originalname, new Date().toISOString());
                    console.timeEnd('response-preparation');
                    console.timeEnd('total-request');
                    res.download(outputPath, `${file.originalname}.mp3`, (error) => {
                        if(error){
                            console.log(error);
                            res.status(500).send('[MP4 > MP3] Error downloading file: ', error);
                        } else {
                            console.log('[MP4 > MP3] Audio sent back to user: ', file.originalname);
                            
                            try {
                                fs.unlinkSync(tempFilePath);
                                fs.unlinkSync(outputPath);
                                console.log('[MP4 > MP3] Files successfully deleted from temp storage.');
                            } catch (cleanupError) {
                                console.error('[MP4 > MP3] Error during cleanup:', cleanupError);
                            }
                        }
                    });
                })
                .on('error', (error) => {
                    console.error('[MP4 > MP3] Error during conversion:', error);
                    res.status(500).send('[MP4 > MP3] Error converting file: ', error);
                });

        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).send('Internal Server Error');
        }
    },


    
}